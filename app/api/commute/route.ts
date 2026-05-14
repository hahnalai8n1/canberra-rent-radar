import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { origins, destination, mode } = await request.json();

    if (!origins || !destination || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('Missing GOOGLE_MAPS_API_KEY in environment variables.');
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    const originsString = origins
      .map((org: string) => `${org.trim()}, ACT, Australia`)
      .join('|');

    const destinationString = `${destination.trim()}, Australia`;

    const params = new URLSearchParams({
      origins: originsString,
      destinations: destinationString,
      mode,
      key: apiKey,
    });

    // Google Distance Matrix transit mode usually needs a departure time.
    if (mode === 'transit') {
      params.set('departure_time', 'now');
    }

    // Optional: make driving routes more realistic.
    if (mode === 'driving') {
      params.set('departure_time', 'now');
    }

    const googleApiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;

    const response = await fetch(googleApiUrl);
    const data = await response.json();

    // Useful while debugging on Vercel logs.
    console.log(
      'Google Distance Matrix response:',
      JSON.stringify(data, null, 2),
    );

    if (data.status !== 'OK') {
      console.error('Google API Error:', data.status, data.error_message);
      return NextResponse.json(
        {
          error: `Google API Error: ${data.status}`,
          details: data.error_message ?? null,
        },
        { status: 500 },
      );
    }

    const commuteTimes = data.rows.map((row: any, index: number) => {
      const element = row.elements[0];
      const cleanSuburbName = origins[index].trim();

      if (element.status === 'OK' && element.duration) {
        return {
          suburb: cleanSuburbName,
          durationMinutes: Math.round(element.duration.value / 60),
          status: 'OK',
        };
      }

      return {
        suburb: cleanSuburbName,
        durationMinutes: null,
        status: element.status,
      };
    });

    return NextResponse.json({ results: commuteTimes });
  } catch (error) {
    console.error('Commute API Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
