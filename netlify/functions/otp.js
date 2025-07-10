exports.handler = async (event) => {
  const { number } = event.queryStringParameters;

  if (!number) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing 'number' query parameter" }),
    };
  }

  try {
    const samsungRequest = fetch('https://www.samsung.com/in/api/v1/sso/otp/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify(JSON.stringify({ user_id: number }))
    });

    const swiggyRequest = fetch('https://profile.swiggy.com/api/v3/app/request_call_verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Swiggy/1.0'
      },
      body: JSON.stringify({ mobile: number })
    });

    const [samsungRes, swiggyRes] = await Promise.all([samsungRequest, swiggyRequest]);

    const samsungData = await samsungRes.json().catch(() => ({}));
    const swiggyData = await swiggyRes.json().catch(() => ({}));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        number,
        results: {
          samsung: {
            status: samsungRes.status,
            response: samsungData
          },
          swiggy: {
            status: swiggyRes.status,
            response: swiggyData
          }
        }
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Error occurred while hitting OTP APIs',
        message: err.message
      })
    };
  }
};
