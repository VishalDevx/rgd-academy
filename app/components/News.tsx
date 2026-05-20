import { Calendar, Clock, ArrowRight, Bell, Megaphone } from "lucide-react";
import { Button } from "./ui/button";


const newsItems = [
  {
    id: 1,
    title: "KakshaOne Students Excel in State Science Olympiad",
    excerpt: "Our students secured top positions in the State Science Olympiad, bringing pride to our school community.",
    date: "Jan 15, 2024",
    category: "Achievement",
    featured: true,
  },
  {
    id: 2,
    title: "New Computer Lab Inauguration",
    excerpt: "State-of-the-art computer lab with 50 workstations inaugurated to enhance digital learning.",
    date: "Jan 10, 2024",
    category: "Infrastructure",
    featured: false,
  },
  {
    id: 3,
    title: "Annual Sports Day Announced",
    excerpt: "Mark your calendars! Annual Sports Day scheduled for March 15, 2024. All parents invited.",
    date: "Jan 8, 2024",
    category: "Event",
    featured: false,
  },
];

const upcomingEvents = [
  { title: "Parent-Teacher Meeting", date: "Feb 5, 2024", time: "10:00 AM" },
  { title: "Science Fair", date: "Feb 20, 2024", time: "9:00 AM" },
  { title: "Inter-School Debate", date: "Mar 1, 2024", time: "2:00 PM" },
  { title: "Annual Sports Day", date: "Mar 15, 2024", time: "8:00 AM" },
];

const announcements = [
  "Admissions open for 2024-25 academic year",
  "Winter vacation: Dec 25 - Jan 5",
  "Fee payment deadline: Jan 31, 2024",
];

export const News = () => {
  return (
    <section id="news" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <Megaphone className="w-4 h-4 inline-block mr-2" />
            Stay Updated
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            News & <span className="text-gradient">Events</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Stay informed about the latest happenings at KakshaOne
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* News Column */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-school flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary-foreground" />
              </span>
              Latest News
            </h3>

            {newsItems.map((news, index) => (
              <article
                key={news.id}
                className={`group bg-card rounded-2xl border border-border hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  news.featured ? "lg:flex" : ""
                }`}
              >
                {news.featured && (
                  <div className="lg:w-1/3 aspect-video lg:aspect-auto bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <Megaphone className="w-16 h-16 text-primary/50" />
                  </div>
                )}
                <div className={`p-6 ${news.featured ? "lg:w-2/3" : ""}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {news.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {news.date}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {news.title}
                  </h4>
                  <p className="text-muted-foreground text-sm mb-4">{news.excerpt}</p>
                  <button className="text-primary text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}

            <Button variant="outline" className="w-full">
              View All News
            </Button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-secondary-foreground" />
                </span>
                Upcoming Events
              </h3>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {event.date.split(" ")[0]}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {event.date.split(" ")[1].replace(",", "")}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-gradient-school rounded-2xl p-6 shadow-lg text-primary-foreground">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                Announcements
              </h3>
              <ul className="space-y-3">
                {announcements.map((announcement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-primary-foreground/90"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 mt-2 shrink-0" />
                    {announcement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
