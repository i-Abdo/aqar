"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Home, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInView } from 'react-intersection-observer';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
}

function AnimatedCounter({ end, duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const startTime = Date.now();

    const animateCount = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / duration);
      const currentNum = Math.floor(progress * (end - start) + start);
      setCount(currentNum);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animateCount);
  }, [end, duration, inView]);

  return <span ref={ref}>{count.toLocaleString('ar-DZ')}</span>;
}

interface StatisticsSectionProps {
  propertyCount: number;
  userCount: number;
}

export default function StatisticsSection({ propertyCount, userCount }: StatisticsSectionProps) {
  const stats = [
    { 
      icon: Home, 
      value: propertyCount, 
      label: "عقار متاح",
    },
    { 
      icon: Users, 
      value: userCount, 
      label: "مستخدم مسجل",
    },
  ];

  return (
    <section className="w-full py-12 md:py-16">
      <h2 className="text-3xl font-bold font-headline mb-10">بالأرقام</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center max-w-3xl mx-auto">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-primary/5 p-6 shadow-lg animate-in fade-in slide-in-from-bottom-12 duration-700" style={{ animationDelay: `${200 * (index + 1)}ms` }}>
            <CardHeader className="p-0 mb-4">
              <stat.icon className="h-12 w-12 text-primary mx-auto" />
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-4xl font-bold">
                <AnimatedCounter end={stat.value} />
                +
              </p>
              <p className="text-muted-foreground mt-2">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
