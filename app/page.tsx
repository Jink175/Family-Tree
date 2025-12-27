import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="h-screen flex items-center justify-center flex-col gap-4">
      <h1 className="text-3xl font-bold">
        shadcn/ui đã cài thành công 🎉
      </h1>
      <Button>Click me</Button>
    </main>
  );
}
