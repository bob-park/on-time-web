export default function BeforeLoginLayout({ children }: { children: Readonly<React.ReactNode> }) {
  return (
    <div className="flex size-full p-6">
      <div className="w-full">{children}</div>
    </div>
  );
}
