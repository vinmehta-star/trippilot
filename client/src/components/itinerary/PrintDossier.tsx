import React from 'react';
import { SavedTrip } from '../../types';
import { formatCurrency, formatDate, differenceInDays } from '../../utils/helpers';

interface PrintDossierProps {
  trip: SavedTrip;
}

export const PrintDossier: React.FC<PrintDossierProps> = ({ trip }) => {
  const { request, itinerary, readinessScore } = trip;
  const nights = differenceInDays(request.returnDate, request.departureDate);
  const totalActivities = itinerary.days.reduce((acc, d) => acc + d.activities.length, 0);

  return (
    <div className="hidden print:block w-full bg-white text-gray-900 font-sans p-8 space-y-8 print:p-0 print:m-0 text-sm leading-relaxed">
      
      {/* ─── Header: Official Travel Dossier ─── */}
      <div className="border-b-2 border-orange-500 pb-6 flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-xs uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              TripPilot Itinerary Blueprint
            </span>
            <span className="text-xs text-gray-500 font-mono">
              Ref #{trip.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight">
            {request.destination}
          </h1>
          <p className="text-gray-600 font-medium mt-1">
            {formatDate(request.departureDate)} — {formatDate(request.returnDate)} ({nights} Nights · {nights + 1} Days)
          </p>
        </div>

        <div className="text-right space-y-1">
          <div className="text-2xl font-black font-mono text-gray-900">
            {formatCurrency(request.totalBudget, request.currency)}
          </div>
          <div className="text-xs text-gray-500 font-mono">
            {request.numberOfTravellers} Traveller{request.numberOfTravellers > 1 ? 's' : ''} · ~{formatCurrency(Math.round(request.totalBudget / request.numberOfTravellers), request.currency)}/pax
          </div>
          {readinessScore !== undefined && (
            <div className="inline-block mt-1 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Readiness: {readinessScore}%
            </div>
          )}
        </div>
      </div>

      {/* ─── Trip Vitals Quick Bar ─── */}
      <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
        <div>
          <span className="text-gray-500 block font-mono text-[11px]">Origin</span>
          <strong className="text-gray-900 text-sm font-semibold">{request.startingCity || 'Not specified'}</strong>
        </div>
        <div>
          <span className="text-gray-500 block font-mono text-[11px]">Travel Style</span>
          <strong className="text-gray-900 text-sm font-semibold uppercase">{request.travelStyle}</strong>
        </div>
        <div>
          <span className="text-gray-500 block font-mono text-[11px]">Total Activities</span>
          <strong className="text-gray-900 text-sm font-semibold">{totalActivities} Planned Stops</strong>
        </div>
        <div>
          <span className="text-gray-500 block font-mono text-[11px]">Lodging Standard</span>
          <strong className="text-gray-900 text-sm font-semibold capitalize">{request.preferredAccommodation}</strong>
        </div>
      </div>

      {/* ─── Executive Overview ─── */}
      <div className="space-y-2">
        <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide border-b border-gray-200 pb-1">
          Trip Overview
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          {itinerary.overview}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-xs font-mono text-gray-500 mr-2">Key Interests:</span>
          {request.interests.map((interest) => (
            <span key={interest} className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200 capitalize">
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Day-by-Day Detailed Schedule ─── */}
      <div className="space-y-6 pt-2">
        <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide border-b border-gray-200 pb-1">
          Day-by-Day Schedule
        </h2>

        {itinerary.days.map((day) => (
          <div key={day.dayNumber} className="border border-gray-300 rounded-xl overflow-hidden break-inside-avoid shadow-sm mb-6">
            
            {/* Day Header */}
            <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs bg-orange-600 text-white px-2 py-0.5 rounded">
                  DAY 0{day.dayNumber}
                </span>
                <h3 className="font-bold text-gray-950 text-sm">
                  {day.theme}
                </h3>
              </div>
              <span className="text-xs text-gray-600 font-mono">
                {formatDate(day.date)}
              </span>
            </div>

            {/* Activities List */}
            <div className="p-4 space-y-4 bg-white">
              <div className="divide-y divide-gray-100">
                {day.activities.map((act, idx) => (
                  <div key={act.id || idx} className="py-3 first:pt-0 last:pb-0 flex items-start gap-4">
                    <div className="w-16 flex-shrink-0 font-mono font-bold text-xs text-orange-600 pt-0.5">
                      {act.startTime}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {act.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                            {act.category}
                          </span>
                          <span className="font-mono font-semibold text-xs text-gray-900">
                            {act.estimatedCost > 0 ? formatCurrency(act.estimatedCost, request.currency) : 'Free'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 leading-normal">
                        {act.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 pt-1">
                        {act.location?.name && (
                          <span>📍 Location: <strong>{act.location.name}</strong></span>
                        )}
                        <span>⏱️ Duration: {Math.round(act.durationMinutes / 60 * 10) / 10} hrs</span>
                        {act.travelTimeToNextMinutes ? (
                          <span>🚗 Next Stop: ~{act.travelTimeToNextMinutes} mins</span>
                        ) : null}
                      </div>

                      {act.reasonForRecommendation && (
                        <p className="text-[11px] text-gray-500 italic bg-gray-50 p-1.5 rounded border border-gray-100 mt-1">
                          💡 Why: {act.reasonForRecommendation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Nightly Accommodation */}
              {day.accommodation && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                  <div className="flex items-center gap-2">
                    <span>🛏️ <strong>Overnight Lodging:</strong> {day.accommodation.name}</span>
                    <span className="text-gray-500 capitalize">({day.accommodation.type})</span>
                  </div>
                  <span className="font-mono font-bold text-gray-900">
                    {formatCurrency(day.accommodation.pricePerNight, request.currency)} / night
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Financial Itemized Budget Breakdown Table ─── */}
      <div className="space-y-3 pt-4 break-inside-avoid">
        <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide border-b border-gray-200 pb-1">
          Itemized Budget Allocation
        </h2>

        <table className="w-full text-xs text-left border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700 font-mono uppercase">
              <th className="p-2.5 border border-gray-200">Expense Category</th>
              <th className="p-2.5 border border-gray-200 text-right">Estimated Amount ({request.currency})</th>
              <th className="p-2.5 border border-gray-200 text-right">Share of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="p-2.5 border border-gray-200 font-medium">Intercity Transport (Flights/Trains)</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">{formatCurrency(itinerary.budgetBreakdown.transport, request.currency)}</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">{Math.round((itinerary.budgetBreakdown.transport / itinerary.budgetBreakdown.total) * 100)}%</td>
            </tr>
            <tr>
              <td className="p-2.5 border border-gray-200 font-medium">Accommodation ({nights} Nights)</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">{formatCurrency(itinerary.budgetBreakdown.accommodation, request.currency)}</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">{Math.round((itinerary.budgetBreakdown.accommodation / itinerary.budgetBreakdown.total) * 100)}%</td>
            </tr>
            <tr>
              <td className="p-2.5 border border-gray-200 font-medium">Food & Dining</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">{formatCurrency(itinerary.budgetBreakdown.food, request.currency)}</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">{Math.round((itinerary.budgetBreakdown.food / itinerary.budgetBreakdown.total) * 100)}%</td>
            </tr>
            <tr>
              <td className="p-2.5 border border-gray-200 font-medium">Activities & Admissions</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">{formatCurrency(itinerary.budgetBreakdown.activities, request.currency)}</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">{Math.round((itinerary.budgetBreakdown.activities / itinerary.budgetBreakdown.total) * 100)}%</td>
            </tr>
            <tr>
              <td className="p-2.5 border border-gray-200 font-medium">Local Commute & Public Transit</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">{formatCurrency(itinerary.budgetBreakdown.localTransport, request.currency)}</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">{Math.round((itinerary.budgetBreakdown.localTransport / itinerary.budgetBreakdown.total) * 100)}%</td>
            </tr>
            <tr>
              <td className="p-2.5 border border-gray-200 font-medium">Miscellaneous & Incidental Reserve</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">{formatCurrency(itinerary.budgetBreakdown.miscellaneous, request.currency)}</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">{Math.round((itinerary.budgetBreakdown.miscellaneous / itinerary.budgetBreakdown.total) * 100)}%</td>
            </tr>
            <tr className="bg-amber-50/50">
              <td className="p-2.5 border border-gray-200 font-medium text-amber-900">Emergency Buffer (5%)</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono text-amber-900">{formatCurrency(itinerary.budgetBreakdown.emergencyBuffer, request.currency)}</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono text-amber-900">5%</td>
            </tr>
            <tr className="bg-gray-100 font-bold text-gray-950">
              <td className="p-2.5 border border-gray-200 text-sm">Total Projected Cost</td>
              <td className="p-2.5 border border-gray-200 text-right text-sm font-mono">{formatCurrency(itinerary.budgetBreakdown.total, request.currency)}</td>
              <td className="p-2.5 border border-gray-200 text-right font-mono">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ─── Packing Checklist Summary ─── */}
      {itinerary.packingList && itinerary.packingList.length > 0 && (
        <div className="space-y-3 pt-4 break-inside-avoid">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide border-b border-gray-200 pb-1">
            Essential Packing Checklist
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {itinerary.packingList.map((cat, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
                <strong className="text-xs font-bold text-gray-900 block border-b border-gray-200 pb-1">
                  {cat.category}
                </strong>
                <ul className="space-y-1 text-xs text-gray-700">
                  {cat.items.slice(0, 6).map((item) => (
                    <li key={item.id} className="flex items-center gap-1.5">
                      <span className="text-gray-400">□</span>
                      <span className={item.checked ? 'line-through text-gray-400' : ''}>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Top Local Tips & Emergency Assistance ─── */}
      <div className="grid grid-cols-2 gap-6 pt-4 break-inside-avoid">
        {itinerary.topTips && itinerary.topTips.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1">
              Top Local Recommendations
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-700 list-disc list-inside">
              {itinerary.topTips.map((tip, idx) => (
                <li key={idx} className="leading-snug">{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {itinerary.emergencyContacts && itinerary.emergencyContacts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1">
              Emergency & Important Contacts
            </h3>
            <div className="space-y-1.5 text-xs">
              {itinerary.emergencyContacts.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-red-50 border border-red-100 text-red-900">
                  <span className="font-semibold">{contact.name} ({contact.type})</span>
                  <span className="font-mono font-bold">{contact.number}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer: Authenticity Notice ─── */}
      <div className="border-t border-gray-300 pt-4 mt-8 flex items-center justify-between text-[11px] text-gray-500 font-mono">
        <span>Engineered by TripPilot Adaptive Travel Engine</span>
        <span>Generated for: {trip.request.startingCity} → {trip.request.destination}</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};

export default PrintDossier;

