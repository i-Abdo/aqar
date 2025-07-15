
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { CustomUser, UserRole } from '@/types';
import { Loader2, Search, UserPlus, UserCog, ShieldCheck } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';

type UserWithAdmin = Pick<CustomUser, 'uid' | 'email' | 'displayName' | 'roles' | 'isAdmin'>;

const availableRoles: UserRole[] = ['admin', 'advertiser'];

const roleTranslations: Record<UserRole, string> = {
    admin: 'مسؤول',
    advertiser: 'معلن',
};

export default function AdminRolesPage() {
    const { user: adminUser } = useAuth();
    const [email, setEmail] = useState('');
    const [searchedUser, setSearchedUser] = useState<UserWithAdmin | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [usersWithRoles, setUsersWithRoles] = useState<UserWithAdmin[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | false>(false);
    const { toast } = useToast();

    const fetchUsersWithRoles = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            // Fetch users that have isAdmin:true OR have a non-empty roles array.
            const adminQuery = query(collection(db, "users"), where("isAdmin", "==", true));
            const rolesQuery = query(collection(db, "users"), where("roles", "!=", []));

            const [adminSnapshot, rolesSnapshot] = await Promise.all([
                getDocs(adminQuery),
                getDocs(rolesQuery),
            ]);

            const usersMap = new Map<string, UserWithAdmin>();
            const processSnapshot = (snapshot: typeof adminSnapshot) => {
                 snapshot.docs.forEach(docSnap => {
                    if (!usersMap.has(docSnap.id)) {
                        const data = docSnap.data();
                        usersMap.set(docSnap.id, {
                            uid: docSnap.id,
                            email: data.email,
                            displayName: data.displayName,
                            roles: data.roles || [],
                            isAdmin: data.isAdmin || false,
                        });
                    }
                });
            }

            processSnapshot(adminSnapshot);
            processSnapshot(rolesSnapshot);

            setUsersWithRoles(Array.from(usersMap.values()));
        } catch (error) {
            console.error("Error fetching users with roles:", error);
            toast({ title: "خطأ", description: "لم نتمكن من تحميل المستخدمين ذوي الرتب.", variant: "destructive" });
        } finally {
            setIsLoadingUsers(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUsersWithRoles();
    }, [fetchUsersWithRoles]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setIsSearching(true);
        setSearchedUser(null);
        try {
            const q = query(collection(db, "users"), where("email", "==", email.trim()));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                toast({ title: "غير موجود", description: "لم يتم العثور على مستخدم بهذا البريد الإلكتروني.", variant: "default" });
            } else {
                const userDoc = querySnapshot.docs[0];
                const data = userDoc.data();
                setSearchedUser({
                    uid: userDoc.id,
                    email: data.email,
                    displayName: data.displayName,
                    roles: data.roles || [],
                    isAdmin: data.isAdmin || false,
                });
            }
        } catch (error) {
            console.error("Error searching for user:", error);
            toast({ title: "خطأ", description: "حدث خطأ أثناء البحث عن المستخدم.", variant: "destructive" });
        } finally {
            setIsSearching(false);
        }
    };

    const handleRoleChange = async (userToUpdate: UserWithAdmin, role: UserRole, action: 'add' | 'remove') => {
        if (role === 'admin' && userToUpdate.uid === adminUser?.uid) {
            toast({ title: "إجراء غير مسموح", description: "لا يمكنك إزالة رتبة المسؤول من نفسك.", variant: "destructive" });
            return;
        }

        setIsUpdating(userToUpdate.uid);
        try {
            const userDocRef = doc(db, "users", userToUpdate.uid);
            let updatePayload: Record<string, any>;

            if (role === 'admin') {
                updatePayload = { isAdmin: action === 'add' };
            } else {
                updatePayload = { roles: action === 'add' ? arrayUnion(role) : arrayRemove(role) };
            }

            await updateDoc(userDocRef, updatePayload);

            toast({ title: "تم التحديث", description: `تم ${action === 'add' ? 'إضافة' : 'إزالة'} رتبة "${roleTranslations[role]}" بنجاح.` });
            
            // Refresh local state for both lists
            if (searchedUser?.uid === userToUpdate.uid) {
                setSearchedUser(prev => {
                    if (!prev) return null;
                    if (role === 'admin') {
                        return { ...prev, isAdmin: action === 'add' };
                    }
                    return { ...prev, roles: action === 'add' ? [...(prev.roles || []), role] : prev.roles?.filter(r => r !== role) || [] };
                });
            }
            await fetchUsersWithRoles();

        } catch (error) {
            console.error("Error updating role:", error);
            toast({ title: "خطأ", description: "فشل تحديث رتبة المستخدم.", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };
    
    const renderRoleButtons = (userToUpdate: UserWithAdmin) => {
        return availableRoles.map(role => {
            let hasRole: boolean;
            if (role === 'admin') {
                hasRole = !!userToUpdate.isAdmin;
            } else {
                hasRole = userToUpdate.roles?.includes(role);
            }

            return (
                <Button 
                    key={role}
                    size="sm"
                    variant={hasRole ? "destructive_outline" : "outline"}
                    onClick={() => handleRoleChange(userToUpdate, role, hasRole ? 'remove' : 'add')}
                    disabled={isUpdating === userToUpdate.uid || (role === 'admin' && userToUpdate.uid === adminUser?.uid)}
                    title={role === 'admin' && userToUpdate.uid === adminUser?.uid ? "لا يمكنك إزالة صلاحياتك" : ""}
                >
                    {isUpdating === userToUpdate.uid ? <Loader2 className="h-4 w-4 animate-spin"/> : (hasRole ? `إزالة "${roleTranslations[role]}"` : `إضافة "${roleTranslations[role]}"`)}
                </Button>
            );
        });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-headline">إدارة رتب المستخدمين</h1>
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserPlus /> إضافة وتعديل الرتب</CardTitle>
                        <CardDescription>ابحث عن مستخدم عن طريق البريد الإلكتروني وقم بتعديل رتبه.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email-search">بريد المستخدم الإلكتروني</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="email-search"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@mail.com"
                                        disabled={isSearching}
                                    />
                                    <Button type="submit" disabled={isSearching || !email.trim()}>
                                        {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                                    </Button>
                                </div>
                            </div>
                        </form>
                        {searchedUser && (
                            <div className="mt-6 border-t pt-4 space-y-3">
                                <h3 className="font-semibold">{searchedUser.displayName || searchedUser.email}</h3>
                                {searchedUser.isAdmin && <Badge variant="destructive"><ShieldCheck className="h-4 w-4 mr-1"/> مسؤول</Badge>}
                                <div className="flex flex-wrap gap-2">
                                    {renderRoleButtons(searchedUser)}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserCog /> المستخدمون أصحاب الرتب</CardTitle>
                        <CardDescription>عرض وتعديل رتب المستخدمين الحاليين.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingUsers ? (
                            <div className="flex justify-center py-8"><Loader2 className="animate-spin h-8 w-8" /></div>
                        ) : usersWithRoles.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">لا يوجد مستخدمون لديهم رتب خاصة حاليًا.</p>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {usersWithRoles.map(user => (
                                    <div key={user.uid} className="p-3 border rounded-md space-y-2">
                                        <div>
                                            <p className="font-semibold">{user.displayName}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {user.isAdmin && <Badge variant="destructive"><ShieldCheck className="h-4 w-4 mr-1"/> {roleTranslations.admin}</Badge>}
                                            {user.roles?.map(role => (
                                                <Badge key={role} variant="secondary">{roleTranslations[role as UserRole] || role}</Badge>
                                            ))}
                                        </div>
                                        <Separator />
                                        <div className="flex flex-wrap gap-2">
                                            {renderRoleButtons(user)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    