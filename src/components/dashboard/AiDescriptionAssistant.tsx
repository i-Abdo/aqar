"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2 } from 'lucide-react';
import { improvePropertyDescription, ImprovePropertyDescriptionInput } from '@/ai/flows/improve-property-description';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface AiDescriptionAssistantProps {
  currentDescription: string;
  onDescriptionChange: (newDescription: string) => void;
  imageDataUri?: string; // Optional for now, will be required if image analysis is part of the flow
}

export function AiDescriptionAssistant({
  currentDescription,
  onDescriptionChange,
  imageDataUri,
}: AiDescriptionAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedDescription, setSuggestedDescription] = useState('');
  const { toast } = useToast();

  const handleSuggestDescription = async () => {
    if (!imageDataUri) {
      toast({
        title: 'صورة مطلوبة',
        description: 'يرجى تحميل صورة أولاً لاستخدام مساعد الوصف.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSuggestedDescription('');
    try {
      const input: ImprovePropertyDescriptionInput = {
        currentDescription,
        imageDataUri,
      };
      const result = await improvePropertyDescription(input);
      if ('improvedDescription' in result) {
        setSuggestedDescription(result.improvedDescription);
        toast({ title: 'اقتراح جديد متاح!', description: 'راجع الوصف المقترح أدناه.' });
      } else {
        toast({
          title: 'خطأ في إنشاء الاقتراح',
          description: result.error || 'تعذر على الذكاء الاصطناعي تقديم اقتراح هذه المرة.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error improving description:', error);
      toast({
        title: 'خطأ فادح',
        description: 'حدث خطأ غير متوقع أثناء محاولة تحسين الوصف. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestedDescription) {
      onDescriptionChange(suggestedDescription);
      setSuggestedDescription(''); // Clear suggestion after applying
      toast({ title: 'تم تطبيق الاقتراح!' });
    }
  };

  return (
    <Card className="mt-6 bg-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          <span>مساعد الوصف بالذكاء الاصطناعي</span>
        </CardTitle>
        <CardDescription>
          احصل على اقتراحات لتحسين وصف عقارك بناءً على الصورة والنص الحالي.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSuggestDescription} disabled={isLoading || !imageDataUri} className="w-full md:w-auto transition-smooth">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'جاري إنشاء الاقتراح...' : 'اقترح وصفًا محسنًا'}
        </Button>
        {!imageDataUri && <p className="text-sm text-muted-foreground">يرجى تحميل صورة للعقار لتفعيل هذه الميزة.</p>}
        
        {suggestedDescription && (
          <div className="space-y-2 p-4 border rounded-md bg-background shadow">
            <Label htmlFor="suggestedDescription" className="font-semibold">الوصف المقترح:</Label>
            <Textarea
              id="suggestedDescription"
              value={suggestedDescription}
              readOnly
              rows={5}
              className="bg-muted"
            />
            <Button onClick={handleApplySuggestion} variant="outline_primary" className="w-full md:w-auto transition-smooth">
              تطبيق الاقتراح
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
