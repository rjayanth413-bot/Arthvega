exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=30'
  };

  try {
    // Fetch from CoinGecko - no CORS issue because this runs on SERVER
    const ids = 'bitcoin,ethereum,matic-network,solana,tether,binancecoin,ripple,cardano,dogecoin,avalanche-2,chainlink,uniswap';
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,inr&include_24hr_change=true&include_24hr_vol=true`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error('CoinGecko: ' + response.status);
    const data = await response.json();

    // Also fetch USD/INR rate
    let usdInr = 83.5;
    try {
      const fxRes = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR');
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        usdInr = fxData.rates?.INR || usdInr;
      }
    } catch(e) {}

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        data, 
        usdInr,
        timestamp: Date.now()
      })
    };

  } catch (error) {
    // Return error so frontend knows to use fallback
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: Date.now()
      })
    };
  }
};
