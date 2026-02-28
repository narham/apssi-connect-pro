import { useState } from "react";
import { Calendar, Clock, MapPin, Edit3, Plus, Trash2, ChevronDown, Users, Shield } from "lucide-react";

const matchDays = [
  {
    date: "Feb 28, 2026",
    label: "Matchday 5",
    matches: [
      { id: "M-101", home: "Garuda Muda FC", away: "Elang Jaya", time: "09:00", venue: "GBK Mini Field A", group: "Group A", status: "completed", score: "3-1" },
      { id: "M-102", home: "Rajawali United", away: "Banteng FC", time: "09:00", venue: "GBK Mini Field B", group: "Group A", status: "live", score: "0-0" },
      { id: "M-103", home: "Singa Putih", away: "Harimau FC", time: "11:00", venue: "Senayan Training Ground", group: "Group B", status: "live", score: "1-3" },
      { id: "M-104", home: "Naga Emas", away: "Macan Kumbang FC", time: "15:30", venue: "GBK Mini Field A", group: "Group B", status: "scheduled" },
      { id: "M-105", home: "Garuda Muda FC", away: "Rajawali United", time: "17:00", venue: "GBK Mini Field B", group: "Group A", status: "scheduled" },
      { id: "M-106", home: "Elang Jaya", away: "Banteng FC", time: "17:00", venue: "Senayan Training Ground", group: "Group A", status: "scheduled" },
    ],
  },
  {
    date: "Mar 1, 2026",
    label: "Matchday 6",
    matches: [
      { id: "M-107", home: "Harimau FC", away: "Naga Emas", time: "09:00", venue: "GBK Mini Field A", group: "Group B", status: "scheduled" },
      { id: "M-108", home: "Macan Kumbang FC", away: "Singa Putih", time: "09:00", venue: "GBK Mini Field B", group: "Group B", status: "scheduled" },
      { id: "M-109", home: "Banteng FC", away: "Garuda Muda FC", time: "11:00", venue: "Senayan Training Ground", group: "Group A", status: "scheduled" },
    ],
  },
];

const venues = [
  { name: "GBK Mini Field A", capacity: 500, status: "active", matchesToday: 3 },
  { name: "GBK Mini Field B", capacity: 500, status: "active", matchesToday: 3 },
  { name: "Senayan Training Ground", capacity: 300, status: "active", matchesToday: 2 },
];

const commissioners = [
  { name: "Pak Hadi Saputra", matches: 5, province: "DKI Jakarta", status: "on-duty" },
  { name: "Pak Joko Widodo", matches: 4, province: "Jawa Barat", status: "on-duty" },
  { name: "Pak Surya Darma", matches: 3, province: "Jawa Timur", status: "standby" },
  { name: "Pak Ahmad Fauzi", matches: 2, province: "Banten", status: "off-duty" },
];

const statusStyles = {
  completed: "text-muted-foreground bg-muted/40",
  live: "text-destructive bg-destructive/10",
  scheduled: "text-accent bg-accent/10",
};

const TournamentSchedule = () => {
  const [expandedDay, setExpandedDay] = useState(0);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground uppercase tracking-wider">Match Schedule & Control</h1>
          <p className="text-xs font-montserrat text-muted-foreground mt-1">Manage match scheduling, venue assignments, and commissioner delegation</p>
        </div>
        <button className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider micro-hover">
          <Plus className="w-4 h-4" /> Add Match
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Schedule — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {matchDays.map((day, dayIdx) => (
            <div key={day.date} className="glass-card rounded-lg relative z-0 overflow-hidden">
              <div className="relative z-10">
                <button
                  onClick={() => setExpandedDay(expandedDay === dayIdx ? -1 : dayIdx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-destructive" />
                    <div className="text-left">
                      <p className="text-sm font-oswald font-bold text-foreground uppercase">{day.label}</p>
                      <p className="text-[10px] font-montserrat text-muted-foreground">{day.date} • {day.matches.length} matches</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedDay === dayIdx ? "rotate-180" : ""}`} />
                </button>
                {expandedDay === dayIdx && (
                  <div className="px-4 pb-4 space-y-2">
                    {day.matches.map((match) => (
                      <div key={match.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="w-12 text-center shrink-0">
                          <p className="text-xs font-oswald font-bold text-foreground">{match.time}</p>
                          <span className={`text-[8px] font-montserrat font-bold px-1.5 py-0.5 rounded-full ${statusStyles[match.status as keyof typeof statusStyles]}`}>
                            {match.status === "live" ? "LIVE" : match.status === "completed" ? "FT" : "SCH"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-oswald font-bold text-foreground uppercase truncate">{match.home}</span>
                            <span className="text-[10px] font-montserrat text-muted-foreground">
                              {match.score ? match.score : "vs"}
                            </span>
                            <span className="text-xs font-oswald font-bold text-foreground uppercase truncate">{match.away}</span>
                          </div>
                          <p className="text-[9px] font-montserrat text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {match.venue} • {match.group}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button className="w-7 h-7 rounded bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors">
                            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right sidebar: Venues + Commissioners */}
        <div className="space-y-4">
          {/* Venues */}
          <div className="glass-card rounded-lg p-5 relative z-0">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 gradient-line-vertical rounded-full" />
                <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">Venues</h2>
              </div>
              <div className="space-y-2.5">
                {venues.map((venue) => (
                  <div key={venue.name} className="p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-montserrat font-semibold text-foreground">{venue.name}</p>
                      <span className="text-[9px] font-montserrat font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                        {venue.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[9px] font-montserrat text-muted-foreground mt-1">
                      Cap: {venue.capacity} • {venue.matchesToday} matches today
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Commissioners */}
          <div className="glass-card rounded-lg p-5 relative z-0">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 gradient-line-vertical rounded-full" />
                <h2 className="text-sm font-oswald font-bold text-foreground uppercase tracking-[0.15em]">Commissioners</h2>
              </div>
              <div className="space-y-2.5">
                {commissioners.map((c) => (
                  <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-montserrat font-semibold text-foreground truncate">{c.name}</p>
                      <p className="text-[9px] font-montserrat text-muted-foreground">{c.province} • {c.matches} matches</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      c.status === "on-duty" ? "bg-accent" :
                      c.status === "standby" ? "bg-muted-foreground" : "bg-destructive/40"
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentSchedule;
