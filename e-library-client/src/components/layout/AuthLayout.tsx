import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-primary items-center justify-center p-12">
        <div className="max-w-md text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl">
              <BookOpen className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold">ResourceHub</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Your one-stop platform for educational resources
          </h2>
          <p className="text-white/80 text-lg">
            Access lecture notes, past exams, tutorials, and more. Collaborate with peers and enhance your learning experience.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-sm font-medium"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-white/80">Join 10,000+ students</span>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="p-2 bg-primary rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">ResourceHub</span>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
