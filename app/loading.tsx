export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Animated Spinner */}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <h2 className="text-lg font-medium text-foreground">
          Loading, please wait...
        </h2>
        <p className="text-sm text-muted-foreground">
          We are fetching your content.
        </p>
      </div>
    </div>
  );
}
