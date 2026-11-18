// src/card-deck.ts
// Local card vault: 100% Client-Side storage in localStorage

import { CardProfile } from './sorting-engine';

const STORAGE_KEY = 'faceday_deck_v1';

export class CardDeckVault {
  public getCards(): CardProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveCard(card: CardProfile): void {
    try {
      const deck = this.getCards();
      // Prepend so latest card is first
      deck.unshift(card);
      // Keep up to 50 cards
      if (deck.length > 50) deck.length = 50;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
    } catch (e) {
      console.error('[Face Day] Error saving card to vault:', e);
    }
  }

  public deleteCard(id: string): void {
    try {
      const deck = this.getCards().filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
    } catch (e) {
      console.error('[Face Day] Error deleting card:', e);
    }
  }

  public getStats() {
    const cards = this.getCards();
    const thorCount = cards.filter((c) => c.team === 'thor').length;
    const doomCount = cards.filter((c) => c.team === 'doom').length;
    const maxPower = cards.reduce((acc, c) => Math.max(acc, c.powerRating), 0);

    return {
      total: cards.length,
      thorCount,
      doomCount,
      maxPower
    };
  }
}

export const deckVault = new CardDeckVault();
