export async function validatePostcode(postcode: string) {
    try {
        const response = await fetch(`/api/validate-postal-code?postcode=${encodeURIComponent(postcode)}`);
        const data = await response.json();
        
        // Return both the response status and the data
        return {
            ok: response.ok,
            isValid: data.isValid,
            error: data.error
        };
    } catch (error) {
        console.error('Error validating postcode:', error);
        return { 
            ok: false,
            isValid: false, 
            error: error instanceof Error ? error.message : String(error) 
        };
    }
}