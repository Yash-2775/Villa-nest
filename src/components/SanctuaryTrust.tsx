import { ShieldCheck, Snowflake, Trophy, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TrustFeature = ({ icon: Icon, title, description }: any) => (
    <div className="group p-10 rounded-xl border border-black/5 bg-background shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-8 bg-accent/10 text-accent transition-transform group-hover:scale-110">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-4 leading-tight">{title}</h3>
        <p className="text-foreground/40 leading-relaxed font-light text-sm">{description}</p>
    </div>
);

const SanctuaryTrust = () => {
    return (
        <section className="py-32 bg-secondary relative overflow-hidden Grainy">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">

                    {/* Left Text */}
                    <div className="lg:col-span-5 space-y-10">
                        <div className="space-y-6">
                            <Badge variant="outline" className="px-6 py-2 border-accent/20 text-accent rounded-full text-[10px] font-black tracking-[0.3em] uppercase bg-background/40">
                                High Quality Homes
                            </Badge>
                            <h2 className="text-6xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.9]">
                                Built for <br />
                                <span className="text-accent/30 italic font-serif">Comfort</span>
                            </h2>
                            <p className="text-foreground/60 text-xl font-light leading-relaxed max-w-lg">
                                We choose the best villas for your stay. Each home
                                is carefully checked before being added to our list.
                            </p>
                        </div>

                        <div className="pt-8 border-t border-black/5 grid grid-cols-2 gap-8">
                            <div>
                                <span className="block text-4xl font-black text-accent tracking-tighter">98%</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Guest Satisfaction</span>
                            </div>
                            <div>
                                <span className="block text-4xl font-black text-accent tracking-tighter">15+</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Villas available</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Features Grid */}
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6 md:mt-12">
                            <TrustFeature
                                icon={ShieldCheck}
                                title="Safe & Private"
                                description="Secure locations that give you perfect peace."
                            />
                            <TrustFeature
                                icon={Wind}
                                title="Fresh & Natural"
                                description="Homes designed to let in the fresh air and natural sunlight."
                            />
                        </div>
                        <div className="space-y-6">
                            <TrustFeature
                                icon={Snowflake}
                                title="Personal help"
                                description="We help you plan your perfect stay and take care of everything."
                            />
                            <TrustFeature
                                icon={Trophy}
                                title="Best Service"
                                description="We are known for having the best homes and great service."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SanctuaryTrust;
