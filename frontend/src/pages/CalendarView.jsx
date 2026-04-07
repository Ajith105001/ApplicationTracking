import { useState, useEffect } from 'react';
import api from '../api';
import {
  Calendar as CalIcon, ChevronLeft, ChevronRight, Clock, Video, Phone,
  MapPin, Bot, Users, CheckCircle2
} from 'lucide-react';

const typeIcons = { phone: Phone, video: Video, onsite: MapPin, technical: Bot, panel: Users, final: CheckCircle2 };
const typeColors = {
  phone: 'bg-blue-100 text-blue-700 border-blue-200',
  video: 'bg-purple-100 text-purple-700 border-purple-200',
  onsite: 'bg-green-100 text-green-700 border-green-200',
  technical: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  panel: 'bg-amber-100 text-amber-700 border-amber-200',
  final: 'bg-red-100 text-red-700 border-red-200',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarView() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // month | week

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  useEffect(() => {
    setLoading(true);
    api.getInterviews({ limit: 200 })
      .then(data => setInterviews(data.interviews))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getInterviewsForDate = (day) => {
    return interviews.filter(iv => {
      const d = new Date(iv.scheduledAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));
  const goToday = () => setCurrentDate(new Date());

  const selectedInterviews = selectedDate ? getInterviewsForDate(selectedDate) : [];
  const todayInterviews = interviews.filter(iv => {
    const d = new Date(iv.scheduledAt);
    return d.toDateString() === today.toDateString() && iv.status === 'scheduled';
  });

  // Build calendar grid
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">{todayInterviews.length} interviews today</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="btn-secondary text-sm">Today</button>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setView('month')} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Month</button>
            <button onClick={() => setView('week')} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'week' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Week</button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 card">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-lg font-semibold text-gray-900">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">{day}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="bg-gray-50 min-h-[100px]" />;
                const dayInterviews = getInterviewsForDate(day);
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                const isSelected = selectedDate === day;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(day === selectedDate ? null : day)}
                    className={`bg-white min-h-[100px] p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'ring-2 ring-primary-500 ring-inset' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center' : 'text-gray-700'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayInterviews.slice(0, 3).map(iv => {
                        const Icon = typeIcons[iv.type] || Video;
                        const color = typeColors[iv.type] || typeColors.video;
                        return (
                          <div key={iv.id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border ${color} truncate`}>
                            <Icon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(iv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {' '}{iv.Application?.Candidate?.firstName}
                            </span>
                          </div>
                        );
                      })}
                      {dayInterviews.length > 3 && (
                        <div className="text-xs text-gray-400 pl-1">+{dayInterviews.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar - Selected day / Upcoming */}
        <div className="space-y-4">
          {selectedDate ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {MONTHS[month]} {selectedDate}, {year}
              </h3>
              {selectedInterviews.length === 0 ? (
                <p className="text-sm text-gray-400">No interviews scheduled</p>
              ) : (
                <div className="space-y-3">
                  {selectedInterviews.map(iv => {
                    const Icon = typeIcons[iv.type] || Video;
                    return (
                      <div key={iv.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-primary-600" />
                          <span className="text-sm font-medium capitalize">{iv.type}</span>
                          <span className={`badge text-xs ${iv.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : iv.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{iv.status}</span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">
                          {iv.Application?.Candidate?.firstName} {iv.Application?.Candidate?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{iv.Application?.Job?.title}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(iv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span>• {iv.duration} min</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CalIcon className="w-4 h-4 text-primary-600" /> Today's Interviews
                </h3>
                {todayInterviews.length === 0 ? (
                  <p className="text-sm text-gray-400">No interviews today</p>
                ) : (
                  <div className="space-y-2">
                    {todayInterviews.map(iv => (
                      <div key={iv.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full">
                          {(() => { const I = typeIcons[iv.type] || Video; return <I className="w-4 h-4" />; })()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {iv.Application?.Candidate?.firstName} {iv.Application?.Candidate?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(iv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {iv.duration}min
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Interview Types</h3>
                <div className="space-y-2">
                  {Object.entries(typeColors).map(([type, color]) => {
                    const Icon = typeIcons[type] || Video;
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${color}`}>
                          <Icon className="w-3 h-3" />
                          <span className="capitalize font-medium">{type}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
