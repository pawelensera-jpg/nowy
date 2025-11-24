import React, { useState } from 'react';
import { DeliveryItem } from '../types';

interface Props {
  delivery: DeliveryItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDelivery: DeliveryItem) => void;
}

interface Errors {
  companyName?: string;
  time?: string;
  plateNumber?: string;
  rampId?: string;
}

export const EditDeliveryModal: React.FC<Props> = ({ delivery, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<DeliveryItem>({ ...delivery });
  const [errors, setErrors] = useState<Errors>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Errors = {};
    let isValid = true;

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Nazwa firmy jest wymagana';
      isValid = false;
    }

    // Validate Time Format HH:MM and Warehouse Hours (06:30 - 20:30)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!formData.time.trim()) {
      newErrors.time = 'Godzina jest wymagana';
      isValid = false;
    } else if (!timeRegex.test(formData.time.trim())) {
      newErrors.time = 'Nieprawidłowy format (HH:MM)';
      isValid = false;
    } else {
      // Check operating hours
      const [h, m] = formData.time.split(':').map(Number);
      const totalMinutes = h * 60 + m;
      const startLimit = 6 * 60 + 30; // 06:30
      const endLimit = 20 * 60 + 30;  // 20:30

      if (totalMinutes < startLimit || totalMinutes > endLimit) {
        newErrors.time = 'Awizacja możliwa między 06:30 a 20:30';
        isValid = false;
      }
    }

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = 'Numer rejestracyjny jest wymagany';
      isValid = false;
    }

    if (!formData.rampId) {
      newErrors.rampId = 'Wybór bramy jest wymagany';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // If time changes, update datetime object
      if (name === 'time') {
         // Only update datetime if format is valid, otherwise keep old datetime or ignore for now
         const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
         if (timeRegex.test(value)) {
            const [h, m] = value.split(':').map(Number);
            const newDate = new Date(prev.datetime);
            newDate.setHours(h);
            newDate.setMinutes(m);
            updated.datetime = newDate;
         }
      }

      return updated;
    });

    // Clear error for this field if it exists
    if (errors[name as keyof Errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="bg-sky-700 px-4 py-3 flex justify-between items-center text-white">
          <h3 className="font-bold">Edycja Awizacji #{formData.originalId}</h3>
          <button onClick={onClose} className="hover:bg-sky-600 rounded p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Firma</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-sky-500 ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.companyName && <span className="text-xs text-red-500 mt-1">{errors.companyName}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Godzina (HH:MM)</label>
              <input
                type="text"
                name="time"
                placeholder="HH:MM"
                value={formData.time}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-sky-500 ${errors.time ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.time && <span className="text-xs text-red-500 mt-1">{errors.time}</span>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rejestracja</label>
              <input
                type="text"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-sky-500 ${errors.plateNumber ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.plateNumber && <span className="text-xs text-red-500 mt-1">{errors.plateNumber}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Brama</label>
            <select
              name="rampId"
              value={formData.rampId}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-sky-500 ${errors.rampId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">-- Wybierz Bramę --</option>
              <option value="Brama W1">Brama W1 (Kurier)</option>
              <option value="Brama W3">Brama W3 (Załadunek)</option>
              <option value="Brama W4">Brama W4 (Załadunek - Podjazd)</option>
              <option value="Brama W5">Brama W5 (Rozładunek)</option>
              <option value="Brama W6">Brama W6 (Rozładunek - Podjazd)</option>
              <option value="Brama W7">Brama W7 (Rozładunek - Podjazd)</option>
              <option value="Brama W8">Brama W8 (Rozładunek - Celltrion/Alvotech)</option>
            </select>
            {errors.rampId && <span className="text-xs text-red-500 mt-1">{errors.rampId}</span>}
          </div>
          
           <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
             <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="isArrived" 
                        checked={!formData.isArrived} 
                        onChange={() => setFormData(prev => ({...prev, isArrived: false, status: undefined}))}
                    />
                    <span className="text-sm text-gray-800">Oczekuje</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="isArrived" 
                        checked={formData.isArrived} 
                        onChange={() => setFormData(prev => ({...prev, isArrived: true, arrivalTimestamp: prev.arrivalTimestamp || Date.now()}))}
                    />
                    <span className="text-sm text-gray-800">Na placu</span>
                </label>
             </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-sky-600 text-white hover:bg-sky-700 rounded shadow-sm font-medium"
            >
              Zapisz Zmiany
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};