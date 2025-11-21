'use client'

type SubscriptionBadgeProps = {
  isSubscribed: boolean;
  isDemo: boolean;
};

export default function SubscriptionBadge({ isSubscribed, isDemo }: SubscriptionBadgeProps) {
  let label = "";
  let color = "";

  if (isSubscribed) {
    label = "Abonnement actif";
    color = "bg-green-100 text-green-800";
  } else if (isDemo) {
    label = "Démo gratuite";
    color = "bg-yellow-100 text-yellow-800";
  } else {
    return null;
  }

  return (
    <span
      className={`ml-2 px-3 py-1 rounded-lg text-xs font-semibold flex items-center justify-center border border-opacity-20 ${color}`}
    >
      {label}
    </span>
  );
}

