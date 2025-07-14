
"use client";

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import type { Property } from '@/types';
import { useToast } from './use-toast';

interface FavoritesContextType {
  favoriteIds: Set<string>;
  favoriteProperties: Property[];
  toggleFavorite: (property: Property) => void;
  isFavorite: (propertyId: string) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'favorite_properties';

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedFavoritesRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedFavoritesRaw) {
        const storedFavorites = JSON.parse(storedFavoritesRaw) as Property[];
        setFavoriteProperties(storedFavorites);
        setFavoriteIds(new Set(storedFavorites.map(p => p.id)));
      }
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveToLocalStorage = (properties: Property[]) => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(properties));
    } catch (error) {
      console.error("Failed to save favorites to localStorage", error);
    }
  };

  const toggleFavorite = useCallback((property: Property) => {
    setFavoriteIds(prevIds => {
      const newIds = new Set(prevIds);
      let newProperties: Property[];

      if (newIds.has(property.id)) {
        newIds.delete(property.id);
        newProperties = favoriteProperties.filter(p => p.id !== property.id);
        toast({ title: 'تمت الإزالة', description: `تمت إزالة "${property.title}" من المفضلة.` });
      } else {
        newIds.add(property.id);
        newProperties = [...favoriteProperties, property];
        toast({ title: 'تمت الإضافة', description: `تمت إضافة "${property.title}" إلى المفضلة.` });
      }
      
      setFavoriteProperties(newProperties);
      saveToLocalStorage(newProperties);
      return newIds;
    });
  }, [favoriteProperties, toast]);

  const isFavorite = useCallback((propertyId: string) => {
    return favoriteIds.has(propertyId);
  }, [favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, favoriteProperties, toggleFavorite, isFavorite, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
