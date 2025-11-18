import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
};

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  maxProjects: number;
  maxAgents: number;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    interval: 'month',
    features: [
      '1 projet actif',
      '5 agents IA',
      'GitHub intégration',
      'Support communautaire'
    ],
    maxProjects: 1,
    maxAgents: 5
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: [
      '10 projets actifs',
      '10 agents IA',
      'Toutes les intégrations',
      'Support prioritaire',
      'Screenshots illimités',
      'Tests automatiques'
    ],
    maxProjects: 10,
    maxAgents: 10
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      'Projets illimités',
      '10 agents IA',
      'API dédiée',
      'Support 24/7',
      'Déploiement custom',
      'SLA garanti',
      'Formation équipe'
    ],
    maxProjects: -1, // illimité
    maxAgents: 10
  }
];
