import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const TestShopify = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testProductsFunction = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing Shopify products function...');
      
      const { data, error } = await supabase.functions.invoke('shopify-products');
      
      if (error) {
        console.error('Function error:', error);
        setError(`Function error: ${JSON.stringify(error)}`);
        return;
      }

      console.log('Function response:', data);
      setResult(data);
      
    } catch (err) {
      console.error('Caught error:', err);
      setError(`Caught error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCheckoutFunction = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing Shopify checkout function...');
      
      // Use a real test variant ID from your store
      const { data, error } = await supabase.functions.invoke('shopify-checkout', {
        body: {
          lineItems: [
            {
              variantId: 'gid://shopify/ProductVariant/123456789', 
              quantity: 1
            }
          ]
        }
      });
      
      if (error) {
        console.error('Function error:', error);
        setError(`Function error: ${JSON.stringify(error)}`);
        return;
      }

      console.log('Function response:', data);
      setResult(data);
      
    } catch (err) {
      console.error('Caught error:', err);
      setError(`Caught error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopify Integration Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Test Products Function</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testProductsFunction} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test shopify-products'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Checkout Function</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testCheckoutFunction} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test shopify-checkout'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-destructive">
                {error}
              </pre>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestShopify;