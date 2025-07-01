
import { CartProvider } from "@/components/CartContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
