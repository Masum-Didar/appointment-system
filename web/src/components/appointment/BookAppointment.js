'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { formatCurrency } from '@/lib/utils';

export default function BookAppointment({ doctor, chambers, onBook }) {
  const [step, setStep] = useState(1);
  const [selectedChamber, setSelectedChamber] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleChamberSelect = (chamber) => {
    setSelectedChamber(chamber);
    setStep(2);
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/v1/chambers/${selectedChamber.id}/available-slots?date=${date}`);
      const data = await res.json();
      setSlots(data.data || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      await onBook({
        doctorId: doctor.id,
        chamberId: selectedChamber.id,
        scheduleId: selectedSlot.id,
        appointmentDate: selectedDate,
        type: 'new',
        symptoms,
      });
    } finally {
      setBooking(false);
    }
  };

  if (!doctor) return <Spinner />;

  return (
    <div className="space-y-6">
      {step === 1 && (
        <div>
          <h3 className="font-semibold mb-3">Select Chamber</h3>
          {chambers?.map((ch) => (
            <Card
              key={ch.id}
              className={`p-4 mb-2 cursor-pointer hover:border-primary-500 ${
                selectedChamber?.id === ch.id ? 'border-primary-500 ring-2 ring-primary-200' : ''
              }`}
              onClick={() => handleChamberSelect(ch)}
            >
              <p className="font-medium">{ch.name}</p>
              <p className="text-sm text-gray-500">{ch.address}, {ch.city}</p>
              <p className="text-sm font-medium mt-1">{formatCurrency(ch.consultationFee || doctor.consultationFee)}</p>
            </Card>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <button onClick={() => setStep(1)} className="text-sm text-primary-600 hover:underline mb-3">
            &larr; Change Chamber
          </button>
          <h3 className="font-semibold mb-3">Select Date</h3>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateSelect(e.target.value)}
            min={minDate}
          />

          {loadingSlots && <Spinner className="py-4" />}

          {slots.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm text-gray-600 mb-2">Available Slots</h4>
              <div className="space-y-2">
                {slots.filter(s => s.available).map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-3 border rounded-lg cursor-pointer ${
                      selectedSlot?.id === slot.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <p className="font-medium">{slot.startTime} - {slot.endTime}</p>
                    <p className="text-sm text-gray-500">{slot.bookedCount}/{slot.maxPatients} booked</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSlot && (
            <div className="mt-4 space-y-4">
              <Input
                label="Symptoms (optional)"
                placeholder="Describe your symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
              <Button onClick={handleBook} className="w-full" disabled={booking}>
                {booking ? 'Booking...' : `Confirm - ${formatCurrency(doctor.consultationFee)}`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
