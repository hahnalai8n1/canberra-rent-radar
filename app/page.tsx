// src/app/page.tsx
import React from 'react';
import PreferenceForm from '../components/PreferenceForm';
import ResultsList from '../components/ResultsList'; // IMPORT THE NEW COMPONENT

async function getSuburbs() {
  const apiUrl = process.env.WORDPRESS_API_URL;

  if (!apiUrl) {
    throw new Error('WORDPRESS_API_URL is not set.');
  }

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetSuburbs {
          suburbs {
            nodes {
              title
              suburbDetails {
                weeklyRent
                transportScore
                vibe
              }
            }
          }
        }
      `,
    }),
    cache: 'no-store',
  });

  const json = await res.json();
  return json.data.suburbs.nodes;
}

export default async function Home() {
  const suburbs = await getSuburbs();

  return (
    <main className="min-h-screen p-8 bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Canberra Rent Radar
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Find your perfect suburb based on budget, commute, and lifestyle.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Interactive Form */}
          <section className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit sticky top-8">
            <h2 className="text-xl font-bold mb-6 text-slate-800">
              Your Preferences
            </h2>
            <PreferenceForm />
          </section>

          {/* Right Column: Dynamic Results List */}
          <section className="md:col-span-2">
            {/* Pass the GraphQL data down to the Client Component */}
            <ResultsList initialSuburbs={suburbs} />
          </section>
        </div>
      </div>
    </main>
  );
}
