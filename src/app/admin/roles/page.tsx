
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { CustomUser, UserRole } from '@/types';
import { Loader2, Search, UserPlus, UserCog, BadgeInfo } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type UserWithRoles = Pick<CustomUser, 'uid' | 'email' | 'displayName' | 'roles'>;

const availableRoles: UserRole[] = ['advertiser'];

export default function AdminRolesPage() {
    const [email, setEmail] = useState('');
    const [searchedUser, setSearchedUser] = useState<UserWithRoles | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [usersWithRoles, setUsersWithRoles] = useState<UserWithRoles[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | false>(false);
    const { toast } = useToast();

    const fetchUsersWithRoles = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            const q = query(collection(db, "users"), where("roles", "!=", []));
            const querySnapshot = await getDocs(q);
            const usersData = querySnapshot.docs.map(docSnap => ({
                uid: docSnap.id,
                email: docSnap.data().email,
                displayName: docSnap.data().displayName,
                roles: docSnap.data().roles || [],
            } as UserWithRoles));
            setUsersWithRoles(usersData);
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
                setSearchedUser({
                    uid: userDoc.id,
                    email: userDoc.data().email,
                    displayName: userDoc.data().displayName,
                    roles: userDoc.data().roles || [],
                });
            }
        } catch (error) {
            console.error("Error searching for user:", error);
            toast({ title: "خطأ", description: "حدث خطأ أثناء البحث عن المستخدم.", variant: "destructive" });
        } finally {
            setIsSearching(false);
        }
    };

    const handleRoleChange = async (user: UserWithRoles, role: UserRole, action: 'add' | 'remove') => {
        setIsUpdating(user.uid);
        try {
            const userDocRef = doc(db, "users", user.uid);
            const updateAction = action === 'add' ? arrayUnion(role) : arrayRemove(role);
            await updateDoc(userDocRef, { roles: updateAction });
            toast({ title: "تم التحديث", description: `تم ${action === 'add' ? 'إضافة' : 'إزالة'} رتبة "${role}" بنجاح.` });
            
            // Refresh local state for both lists
            if (searchedUser?.uid === user.uid) {
                setSearchedUser(prev => prev ? { ...prev, roles: action === 'add' ? [...(prev.roles || []), role] : prev.roles?.filter(r => r !== role) || [] } : null);
            }
            await fetchUsersWithRoles();

        } catch (error) {
            console.error("Error updating role:", error);
            toast({ title: "خطأ", description: "فشل تحديث رتبة المستخدم.", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-headline">إدارة رتب المستخدمين</h1>
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserPlus /> إضافة رتبة لمستخدم</CardTitle>
                        <CardDescription>ابحث عن مستخدم عن طريق البريد الإلكتروني وقم بإضافة رتبة له.</CardDescription>
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
                                <div className="flex flex-wrap gap-2">
                                    {availableRoles.map(role => {
                                        const hasRole = searchedUser.roles?.includes(role);
                                        return (
                                            <Button 
                                                key={role}
                                                variant={hasRole ? "secondary" : "outline"}
                                                onClick={() => handleRoleChange(searchedUser, role, hasRole ? 'remove' : 'add')}
                                                disabled={isUpdating === searchedUser.uid}
                                            >
                                                {isUpdating === searchedUser.uid ? <Loader2 className="h-4 w-4 animate-spin"/> : (hasRole ? `إزالة رتبة "${role}"` : `إضافة رتبة "${role}"`)}
                                            </Button>
                                        );
                                    })}
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
                                            {user.roles?.map(role => (
                                                <Badge key={role} variant="secondary">{role}</Badge>
                                            ))}
                                        </div>
                                        <Separator />
                                        <div className="flex flex-wrap gap-2">
                                             {availableRoles.map(role => {
                                                const hasRole = user.roles?.includes(role);
                                                return (
                                                    <Button 
                                                        key={role}
                                                        size="sm"
                                                        variant={hasRole ? "destructive_outline" : "outline"}
                                                        onClick={() => handleRoleChange(user, role, hasRole ? 'remove' : 'add')}
                                                        disabled={isUpdating === user.uid}
                                                    >
                                                        {isUpdating === user.uid ? <Loader2 className="h-4 w-4 animate-spin"/> : (hasRole ? `إزالة "${role}"` : `إضافة "${role}"`)}
                                                    </Button>
                                                );
                                            })}
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

