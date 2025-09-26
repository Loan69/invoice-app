'use client'

type SubscriptionBadgeProps = {
  isSubscribed: boolean;
  isDemo: boolean;
};

export default function SubscriptionBadge({ isSubscribed, isDemo }: SubscriptionBadgeProps) {
  let label = '';
  let color = '';

  if (isSubscribed) {
    label = 'Abonnement actif';
    color = 'bg-green-100 text-green-800';
  } else if (isDemo) {
    label = 'Démo gratuite';
    color = 'bg-yellow-100 text-yellow-800';
  } else {
    return null; // Aucun badge si ni démo ni abonnement actif
  }

  return (
    <span
      className={`ml-2 px-3 py-2 rounded-full text-sm font-medium ${color} border border-opacity-20`}
    >
      {label}
    </span>
  );
}
