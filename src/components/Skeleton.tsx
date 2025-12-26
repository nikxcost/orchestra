import { Bot } from 'lucide-react';

interface SkeletonProps {
  className?: string;
}

const SkeletonPulse = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse bg-neutral-200 rounded ${className}`} />
);

export const ResponseSkeleton = () => {
  return (
    <div className="flex items-start gap-4 animate-fadeIn" role="status" aria-label="Loading response">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot className="w-5 h-5 text-white" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 pt-2 space-y-4">
        {/* Typing indicator */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-sm text-neutral-500 font-medium">Генерирую ответ</span>
          <div className="flex items-center gap-1">
            <div
              className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
            />
            <div
              className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: '150ms', animationDuration: '0.8s' }}
            />
            <div
              className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: '300ms', animationDuration: '0.8s' }}
            />
          </div>
        </div>

        {/* Skeleton lines - simulating text content */}
        <div className="space-y-3">
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-11/12" />
          <SkeletonPulse className="h-4 w-4/5" />
        </div>

        {/* Skeleton paragraph break */}
        <div className="pt-2 space-y-3">
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-3/4" />
        </div>

        {/* Skeleton code block */}
        <div className="bg-neutral-100 rounded-xl p-4 space-y-2">
          <SkeletonPulse className="h-3 w-1/3 bg-neutral-300" />
          <SkeletonPulse className="h-3 w-2/3 bg-neutral-300" />
          <SkeletonPulse className="h-3 w-1/2 bg-neutral-300" />
        </div>

        {/* More text */}
        <div className="space-y-3">
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-5/6" />
        </div>

        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export const AgentCardSkeleton = () => {
  return (
    <div className="p-4 rounded-2xl border border-neutral-200 bg-white animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-neutral-200" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-4 w-24" />
          <SkeletonPulse className="h-3 w-full" />
          <SkeletonPulse className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
};
