'use client';

import React from 'react';
import { useFormStore } from '../store/useFormStore';

export default function PreferenceForm() {
  const {
    budget,
    setBudget,
    minTransportScore,
    setMinTransportScore,
    preferredVibe,
    setPreferredVibe,
    workplace,
    setWorkplace,
    commuteMode,
    setCommuteMode,
  } = useFormStore();

  return (
    <div className="space-y-6">
      {/* Budget Slider */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Max Weekly Budget: ${budget}
        </label>
        <input
          type="range"
          min="300"
          max="1000"
          step="50"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>$300</span>
          <span>$1000+</span>
        </div>
      </div>

      {/* Workplace Destination */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Workplace Destination
        </label>
        <select
          value={workplace}
          onChange={(e) => setWorkplace(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Canberra Centre, Canberra ACT">
            Civic / Canberra City
          </option>
          <option value="Barton ACT">Barton / Parliamentary Triangle</option>
          <option value="Belconnen Town Centre, Belconnen ACT">
            Belconnen Town Centre
          </option>
          <option value="Woden Town Centre, Phillip ACT">Woden Valley</option>
          <option value="Tuggeranong Town Centre, Greenway ACT">
            Tuggeranong Town Centre
          </option>
          <option value="Gungahlin Town Centre, Gungahlin ACT">
            Gungahlin Town Centre
          </option>
        </select>
      </div>

      {/* Commute Mode */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Commute Mode
        </label>
        <div className="flex gap-4">
          {['transit', 'driving', 'bicycling'].map((mode) => (
            <label
              key={mode}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="commuteMode"
                value={mode}
                checked={commuteMode === mode}
                onChange={(e) => setCommuteMode(e.target.value)}
                className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-700 text-sm capitalize">{mode}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Transport Score Select */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Minimum Transport Score (1-10)
        </label>
        <select
          value={minTransportScore}
          onChange={(e) => setMinTransportScore(Number(e.target.value))}
          className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1">1 - Don't care, I drive</option>
          <option value="5">5 - Need occasional buses</option>
          <option value="8">8 - Excellent transit needed</option>
        </select>
      </div>

      {/* Vibe Radio Buttons */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Preferred Vibe
        </label>
        <div className="space-y-2">
          {['Any', 'Quiet', 'Busy', 'Family-friendly'].map((vibe) => (
            <label
              key={vibe}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="radio"
                name="vibe"
                value={vibe}
                checked={preferredVibe === vibe}
                onChange={(e) => setPreferredVibe(e.target.value)}
                className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-700 text-sm">{vibe}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
