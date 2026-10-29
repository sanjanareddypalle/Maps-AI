import { jsPDF } from 'jspdf';
import { TripPlan } from './types';

export function generateTripStrategyPDF(trip: TripPlan) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 12) {
      doc.addPage();
      y = margin + 4;
      return true;
    }
    return false;
  };

  // Helper for Section Titles with Decorative Accent
  const renderSectionHeader = (title: string, badgeText: string) => {
    checkPageBreak(22);
    y += 4;
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(margin, y, 3, 14, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42); // Charcoal 900
    doc.text(title, margin + 6, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235);
    doc.text(badgeText.toUpperCase(), margin + 6, y + 12);

    y += 17;
  };

  // ==========================================
  // 1. HEADER BANNER
  // ==========================================
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  // Accent Line inside banner
  doc.setFillColor(37, 99, 235); // Brand Blue
  doc.rect(margin, y, contentWidth, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('Google Maps AI — Complete Travel & Road Trip Strategy', margin + 6, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(
    `Autonomous Agent Architecture Report  •  Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    margin + 6,
    y + 19
  );

  y += 34;

  // ==========================================
  // 2. TRIP OVERVIEW & METRICS
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(trip.title || `Trip to ${trip.destination}`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text(`${trip.origin}  ➔  ${trip.destination}`, margin, y);
  y += 7;

  // Overview Metrics Pills
  const metrics = [
    { label: 'DURATION', val: `${trip.total_days} Days` },
    { label: 'DISTANCE', val: `~${trip.route_summary?.distance_km || 280} km` },
    { label: 'PARTY', val: `${trip.travelers || 2} Travelers` },
    { label: 'BUDGET TIER', val: (trip.budget_level || 'Moderate').toUpperCase() },
  ];

  const pillWidth = (contentWidth - 9) / 4;
  metrics.forEach((m, idx) => {
    const px = margin + idx * (pillWidth + 3);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(px, y, pillWidth, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, px + 3, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, px + 3, y + 9.5);
  });

  y += 17;

  // Summary Note
  if (trip.summary) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(trip.summary, contentWidth - 8);
    doc.text(summaryLines, margin + 4, y + 5.5);
    y += 22;
  }

  // ==========================================
  // 3. MULTI-MODAL TRAVEL ROUTES (ROAD / RAIL / AIR)
  // ==========================================
  if (trip.travel_options && trip.travel_options.length > 0) {
    renderSectionHeader('1. Multi-Modal Travel Routes (Road, Rail & Flight)', 'Verified Timings, Fares & Direct Booking Links');

    trip.travel_options.forEach((opt) => {
      checkPageBreak(25);
      const cardHeight = 22;

      // Card Container
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD');

      // Left Accent Strip based on mode
      const accentColor = opt.mode === 'road' ? [13, 148, 136] : opt.mode === 'train' ? [37, 99, 235] : [124, 58, 237];
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.roundedRect(margin, y, 3, cardHeight, 1.5, 1.5, 'F');

      // Title & Mode Tag
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`[${opt.mode.toUpperCase()}] ${opt.title}`, margin + 6, y + 6);

      // Duration & Pricing
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(37, 99, 235);
      doc.text(`${opt.duration_text}  •  ${opt.estimated_cost}`, margin + 6, y + 11.5);

      // Transit Route details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(opt.distance_or_transit, margin + 6, y + 16.5);

      // CLICKABLE DIRECT BOOKING HYPERLINK
      const bookingUrl =
        opt.booking_url ||
        (opt.mode === 'flight'
          ? `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(trip.origin)}+to+${encodeURIComponent(trip.destination)}`
          : opt.mode === 'train'
          ? `https://www.confirmtkt.com/train-running-status?from=${encodeURIComponent(trip.origin)}&to=${encodeURIComponent(trip.destination)}`
          : `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(trip.origin)}&destination=${encodeURIComponent(trip.destination)}&travelmode=driving`);

      const linkLabel =
        opt.mode === 'flight'
          ? 'Book Flights Online ↗'
          : opt.mode === 'train'
          ? 'Book Train on IRCTC ↗'
          : 'Open Driving Navigation ↗';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(37, 99, 235);
      doc.textWithLink(linkLabel, margin + contentWidth - 44, y + 11.5, { url: bookingUrl });

      y += cardHeight + 4;
    });
    y += 2;
  }

  // ==========================================
  // 3B. LAST-MILE ARRIVAL TRANSFERS
  // ==========================================
  if (trip.last_mile_transfers && trip.last_mile_transfers.options?.length > 0) {
    const lm = trip.last_mile_transfers;
    renderSectionHeader(
      '2. Last-Mile Arrival Transfers (Airport / Station to Hotel)',
      `${lm.hub_name}  ➔  ${lm.destination_name} (${lm.distance_km} km)`
    );

    lm.options.forEach((opt) => {
      checkPageBreak(25);
      const cardHeight = 22;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD');

      // Left Accent Strip
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(margin, y, 3, cardHeight, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${opt.title}  •  ${opt.provider}`, margin + 6, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(37, 99, 235);
      doc.text(`${opt.estimated_fare}`, margin + contentWidth - 45, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Duration: ${opt.duration_text}   |   Luggage: ${opt.luggage_capacity}   |   Convenience: ${'★'.repeat(opt.convenience_score)}`,
        margin + 6,
        y + 11.5
      );

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(opt.availability_notes.slice(0, 85), margin + 6, y + 16.5);

      if (opt.booking_link) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(37, 99, 235);
        doc.textWithLink('Book / Directions ↗', margin + contentWidth - 36, y + 16.5, { url: opt.booking_link });
      }

      y += cardHeight + 4;
    });
    y += 2;
  }

  // ==========================================
  // 4. ALL-BUDGETS STRATEGY BREAKDOWN
  // ==========================================
  if (trip.budget_breakdown && trip.budget_breakdown.length > 0) {
    renderSectionHeader('2. Complete Budgets Strategy Breakdown', 'Itemized Comparison: Budget vs Moderate vs Luxury');

    trip.budget_breakdown.forEach((b) => {
      checkPageBreak(25);
      const cardHeight = 22;

      doc.setFillColor(254, 252, 232); // Amber light
      doc.setDrawColor(253, 230, 138);
      doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD');

      // Left Accent
      doc.setFillColor(217, 119, 6); // Amber 600
      doc.roundedRect(margin, y, 3, cardHeight, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(180, 83, 9);
      doc.text(`${b.title.toUpperCase()}`, margin + 6, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total: ${b.total_estimated}`, margin + contentWidth - 36, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Stay: ${b.stay_cost}   |   Food: ${b.food_cost}   |   Transit: ${b.transport_cost}`, margin + 6, y + 11.5);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const descLines = doc.splitTextToSize(b.description, contentWidth - 12);
      doc.text(descLines, margin + 6, y + 16.5);

      y += cardHeight + 4;
    });
    y += 2;
  }

  // ==========================================
  // 5. RECOMMENDED HOTELS & STAYS (ALL TIERS)
  // ==========================================
  if (trip.hotel_recommendations && trip.hotel_recommendations.length > 0) {
    renderSectionHeader('3. Curated Hotels & Stays (All Budgets)', 'Handpicked Options with Live Rates & Instant Booking Links');

    trip.hotel_recommendations.forEach((h) => {
      checkPageBreak(26);
      const cardHeight = 23;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD');

      // Left Accent Strip
      doc.setFillColor(14, 165, 233); // Sky Blue
      doc.roundedRect(margin, y, 3, cardHeight, 1.5, 1.5, 'F');

      // Hotel Name & Tier
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${h.name}`, margin + 6, y + 6);

      // Tier Badge & Rating
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(14, 165, 233);
      doc.text(`[${h.tier.toUpperCase()}]`, margin + 6, y + 11.5);

      doc.setTextColor(217, 119, 6);
      doc.text(`★ ${h.rating} rating`, margin + 26, y + 11.5);

      doc.setTextColor(15, 23, 42);
      doc.text(`${h.price_per_night}`, margin + 48, y + 11.5);

      // Address & Amenities
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const infoText = `${h.address} • Amenities: ${h.amenities?.slice(0, 3).join(', ')}`;
      doc.text(doc.splitTextToSize(infoText, contentWidth - 52), margin + 6, y + 17);

      // CLICKABLE DIRECT HOTEL BOOKING HYPERLINK
      const hotelBookingUrl =
        h.booking_url ||
        `https://www.google.com/travel/hotels?q=${encodeURIComponent(h.name + ' ' + (h.address || trip.destination))}`;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(37, 99, 235);
      doc.textWithLink('Book on Google Hotels ↗', margin + contentWidth - 44, y + 11.5, { url: hotelBookingUrl });

      y += cardHeight + 4;
    });
    y += 2;
  }

  // ==========================================
  // 6. RECOMMENDED FOOD & LOCAL DINING
  // ==========================================
  if (trip.dining_recommendations && trip.dining_recommendations.length > 0) {
    renderSectionHeader('4. Authentic Regional Food & Famous Dining Spots', 'Signature Dishes, Food Courts & Menu Links');

    trip.dining_recommendations.forEach((d) => {
      checkPageBreak(25);
      const cardHeight = 22;

      doc.setFillColor(240, 253, 244); // Emerald 50
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD');

      doc.setFillColor(16, 185, 129); // Emerald 500
      doc.roundedRect(margin, y, 3, cardHeight, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${d.name}`, margin + 6, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(5, 150, 105);
      doc.text(`[${d.meal_type.toUpperCase()}]`, margin + 6, y + 11.5);

      doc.setTextColor(217, 119, 6);
      doc.text(`★ ${d.rating}`, margin + 26, y + 11.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`${d.cuisine}  •  ${d.price_range}`, margin + 40, y + 11.5);

      // Specialty Dish
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Specialty: ${d.specialty_dish}`, margin + 6, y + 16.5);

      // CLICKABLE DIRECT RESTAURANT HYPERLINK
      const diningUrl =
        d.booking_url ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.name + ' ' + (d.address || trip.destination))}`;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(37, 99, 235);
      doc.textWithLink('View on Google Maps ↗', margin + contentWidth - 44, y + 11.5, { url: diningUrl });

      y += cardHeight + 4;
    });
    y += 2;
  }

  // ==========================================
  // 7. EN-ROUTE HIGHLIGHTS (BETWEEN ORIGIN & DESTINATION)
  // ==========================================
  if (trip.en_route_stops && trip.en_route_stops.length > 0) {
    renderSectionHeader('5. En-Route Highlights Between Source & Destination', 'Scenic Pitstops, Temples & Viewpoints Midway');

    trip.en_route_stops.forEach((s) => {
      checkPageBreak(22);
      const cardHeight = 19;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD');

      doc.setFillColor(99, 102, 241); // Indigo
      doc.roundedRect(margin, y, 3, cardHeight, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`${s.name}  [★ ${s.rating || '4.6'}]`, margin + 6, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const enRouteDesc = `${s.time_to_spend_minutes || 45} mins stopover  •  ${s.reason || s.address || ''}`;
      doc.text(doc.splitTextToSize(enRouteDesc, contentWidth - 48), margin + 6, y + 10.5);

      // Clickable Link
      const enRouteUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ' ' + (s.address || ''))}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(37, 99, 235);
      doc.textWithLink('Directions ↗', margin + contentWidth - 28, y + 8, { url: enRouteUrl });

      y += cardHeight + 3;
    });
    y += 2;
  }

  // ==========================================
  // 8. DAY-BY-DAY COMPREHENSIVE ITINERARY
  // ==========================================
  if (trip.itinerary && trip.itinerary.length > 0) {
    renderSectionHeader('6. Detailed Day-by-Day Travel Itinerary', 'Step-by-Step Waypoints, Time Allocation & Navigation Links');

    trip.itinerary.forEach((day) => {
      checkPageBreak(26);

      // Day Title Header Strip
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(255, 255, 255);
      doc.text(day.title, margin + 4, y + 5.5);
      y += 11;

      // Day Summary
      if (day.summary) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const daySumLines = doc.splitTextToSize(day.summary, contentWidth);
        doc.text(daySumLines, margin, y);
        y += daySumLines.length * 4 + 2;
      }

      // Stops for the day
      day.stops.forEach((stop, idx) => {
        checkPageBreak(24);
        const cardHeight = 20;

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, contentWidth, cardHeight, 1.5, 1.5, 'FD');

        // Stop Number Circle
        doc.setFillColor(37, 99, 235);
        doc.circle(margin + 5, y + 6, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text(`${idx + 1}`, margin + 4.1, y + 7.2);

        // Stop Name & Rating
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`${stop.name}`, margin + 11, y + 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(217, 119, 6);
        doc.text(`★ ${stop.rating || '4.7'}`, margin + 11, y + 11);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Time to spend: ${stop.time_to_spend_minutes || 90} mins   |   ${stop.category?.toUpperCase() || 'ATTRACTION'}`, margin + 28, y + 11);

        // Reason / Address
        if (stop.reason) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);
          const reasonLines = doc.splitTextToSize(stop.reason, contentWidth - 48);
          doc.text(reasonLines, margin + 11, y + 15.5);
        }

        // CLICKABLE DIRECT STOP HYPERLINK
        const stopUrl =
          stop.booking_url ||
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name + ' ' + (stop.address || ''))}`;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(37, 99, 235);
        doc.textWithLink('Google Maps ↗', margin + contentWidth - 30, y + 9.5, { url: stopUrl });

        y += cardHeight + 3;
      });

      y += 4;
    });
  }

  // ==========================================
  // FOOTER WITH PAGINATION
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Google Maps AI Travel Architect  •  Interactive Strategy Report  •  All hyperlinks are clickable`,
      margin,
      pageHeight - 7
    );

    doc.text(`Page ${i} of ${totalPages}`, margin + contentWidth, pageHeight - 7, { align: 'right' });
  }

  const cleanFilename = `GoogleMapsAI-${(trip.destination || 'Trip').replace(/\s+/g, '_')}-Strategy.pdf`;
  doc.save(cleanFilename);
}
