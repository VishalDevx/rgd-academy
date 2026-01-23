import {
  Trophy,
  Music,
  Palette,
  BookOpen,
  Users,
  Gamepad2,
  Globe,
  Microscope,
  Medal,
  Theater,
  Camera,
  Code,
} from "lucide-react";

const activityCategories = [
  {
    title: "Sports",
    icon: Trophy,
    color: "from-primary to-primary/80",
    activities: [
      { name: "Cricket", icon: Trophy },
      { name: "Football", icon: Medal },
      { name: "Basketball", icon: Gamepad2 },
      { name: "Athletics", icon: Trophy },
    ],
  },
  {
    title: "Arts & Culture",
    icon: Palette,
    color: "from-secondary to-secondary/80",
    activities: [
      { name: "Music", icon: Music },
      { name: "Dance", icon: Theater },
      { name: "Art & Craft", icon: Palette },
      { name: "Drama", icon: Theater },
    ],
  },
  {
    title: "Academic Clubs",
    icon: BookOpen,
    color: "from-primary to-secondary",
    activities: [
      { name: "Science Club", icon: Microscope },
      { name: "Math Olympiad", icon: BookOpen },
      { name: "Debate Club", icon: Globe },
      { name: "Coding Club", icon: Code },
    ],
  },
  {
    title: "Special Programs",
    icon: Users,
    color: "from-secondary to-primary",
    activities: [
      { name: "Photography", icon: Camera },
      { name: "Robotics", icon: Gamepad2 },
      { name: "MUN", icon: Globe },
      { name: "Leadership", icon: Users },
    ],
  },
];

export const Activities = () => {
  return (
    <section id="activities" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            Student Life
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Student <span className="text-gradient">Activities</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover the diverse range of extracurricular activities that help our
            students grow beyond academics
          </p>
        </div>

        {/* Activity Categories Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {activityCategories.map((category, categoryIndex) => (
            <div
              key={category.title}
              className="group bg-card rounded-3xl p-6 md:p-8 border border-border hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <category.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.activities.length} programs available
                  </p>
                </div>
              </div>

              {/* Activities List */}
              <div className="grid grid-cols-2 gap-3">
                {category.activities.map((activity, index) => (
                  <div
                    key={activity.name}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group/item"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-school/10 flex items-center justify-center group-hover/item:bg-gradient-school transition-all">
                      <activity.icon className="w-5 h-5 text-primary group-hover/item:text-primary-foreground transition-colors" />
                    </div>
                    <span className="font-medium text-sm">{activity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Featured Activity Banner */}
        <div className="mt-16 relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-school opacity-90" />
          <div className="relative z-10 p-8 md:p-12 text-center text-primary-foreground">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              🏆 Annual Sports Day Coming Soon!
            </h3>
            <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-6">
              Join us for our annual sports extravaganza featuring athletics,
              team sports, and more. Parents and families are welcome!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                📅 March 15, 2024
              </div>
              <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                📍 School Sports Ground
              </div>
              <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                🎯 All Grades Participating
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
