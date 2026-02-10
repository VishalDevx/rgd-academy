import { Target, Eye, Heart, Lightbulb, Shield, Users } from "lucide-react";

const values = [
  {
    icon: Lightbulb,
    title: "Excellence",
    description: "Striving for the highest standards in everything we do",
  },
  {
    icon: Shield,
    title: "Integrity",
    description: "Building character through honesty and ethical behavior",
  },
  {
    icon: Heart,
    title: "Compassion",
    description: "Fostering empathy and kindness in our community",
  },
  {
    icon: Users,
    title: "Community",
    description: "Creating a supportive and inclusive learning environment",
  },
];

export const About = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            About Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Welcome to <span className="text-gradient">RGD Academy</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A legacy of excellence in education, nurturing future leaders since 1999
          </p>
        </div>

        {/* Principal's Message */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-school flex items-center justify-center">
                  <Users className="w-16 h-16 text-primary-foreground" />
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-secondary rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-full -z-10" />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold">
              Principal&apos;s Message
            </h3>
            <blockquote className="text-lg text-muted-foreground italic border-l-4 border-primary pl-6">
              &ldquo;At RGD Academy, we believe every child has the potential to achieve
              greatness. Our mission is to provide an environment where students
              can discover their talents, develop critical thinking skills, and
              become responsible global citizens.&rdquo;
            </blockquote>
            <p className="text-muted-foreground">
              With over two decades of experience in education, we have consistently
              maintained the highest standards of academic excellence while fostering
              creativity, innovation, and character development in our students.
            </p>
            <div className="pt-4">
              <p className="font-semibold text-foreground"> Deepak Kumar</p>
              <p className="text-sm text-muted-foreground">Principal, RGD Academy</p>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="group bg-card rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all border border-border hover:border-primary/50">
            <div className="w-14 h-14 rounded-2xl bg-gradient-school flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To provide holistic education that develops intellectual curiosity,
              emotional intelligence, and social responsibility. We aim to create
              lifelong learners who are prepared to face the challenges of the
              modern world with confidence and integrity.
            </p>
          </div>

          <div className="group bg-card rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all border border-border hover:border-secondary/50">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Eye className="w-7 h-7 text-secondary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              To be a leading institution that inspires excellence in education,
              fostering innovation, creativity, and ethical leadership. We envision
              a community where every student realizes their full potential and
              contributes positively to society.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Our Core Values</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The principles that guide everything we do at RGD Academy
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="group text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-school flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all">
                <value.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h4 className="text-lg font-semibold mb-2">{value.title}</h4>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
