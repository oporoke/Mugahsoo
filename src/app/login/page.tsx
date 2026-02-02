
import { signIn } from "@/auth"
import { AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo";
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  
  const errorMessages: { [key: string]: string } = {
    CredentialsSignin: 'Invalid email or password.',
    Default: 'Something went wrong. Please try again.',
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background/60 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Logo />
            </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to manage your welfare group</CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams?.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>
                {errorMessages[searchParams.error] || errorMessages.Default}
              </AlertDescription>
            </Alert>
          )}
          <form
            action={async (formData) => {
              "use server"
              await signIn("credentials", formData)
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          
          <Separator className="my-4" />

          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/dashboard" })
            }}
            className="w-full"
          >
            <Button type="submit" className="w-full" variant="outline">
              Sign in with Google
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
