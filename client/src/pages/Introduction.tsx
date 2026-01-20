import { Layout } from "@/components/ui/Layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Users, 
  Moon, 
  Sun, 
  Scale, 
  AlertTriangle, 
  MessageCircle,
  Skull,
  Shield,
  Eye,
  Target,
  ArrowLeft,
  BookOpen,
  Gamepad2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Introduction() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-16">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-amber-400 to-amber-700 bg-clip-text text-transparent font-display mb-4">
            Welcome to Ravenswood Bluff
          </h1>
          <p className="text-xl text-amber-100/70 font-serif italic max-w-2xl mx-auto">
            A demon is killing villagers. Find them before it's too late.
          </p>
        </motion.div>

        <motion.section 
          {...fadeInUp}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="bg-card/80 border-amber-900/30 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-amber-500 font-display">The Setup</h2>
            </div>
            <p className="text-foreground/90 font-serif text-lg leading-relaxed">
              Two teams, hidden roles. The <span className="text-blue-400 font-semibold">Good team</span> (most players) 
              wants to execute the demon. The <span className="text-red-400 font-semibold">Evil team</span> (demon + minions) 
              wants to survive until only two players remain.
            </p>
          </Card>
        </motion.section>

        <motion.section 
          {...fadeInUp}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-card/80 border-amber-900/30 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-amber-500 font-display">How It Plays</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-900/30 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-300 mb-1">Night</h3>
                  <p className="text-foreground/80 font-serif">
                    Close your eyes. The Storyteller privately wakes up players to activate their abilities. 
                    Demon kills, Minions disrupt, Good info roles learn clues.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-900/30 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-300 mb-1">Day</h3>
                  <p className="text-foreground/80 font-serif">
                    Open your eyes, learn who died, then talk. Share info, form theories, 
                    catch people in lies, defend yourself from accusations.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-900/30 flex items-center justify-center">
                  <Scale className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-300 mb-1">Execution</h3>
                  <p className="text-foreground/80 font-serif">
                    Nominate someone, vote, and if they get majority they're executed. 
                    One execution max per day, and it's optional.
                  </p>
                </div>
              </div>

              <p className="text-center text-amber-100/60 font-serif italic pt-2">
                Repeat until someone wins.
              </p>
            </div>
          </Card>
        </motion.section>

        <motion.section 
          {...fadeInUp}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="bg-card/80 border-amber-900/30 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-amber-500 font-display">What Makes This Different</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="w-12 h-12 rounded-full bg-yellow-900/30 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-yellow-300 mb-2">Information can be wrong</h3>
                <p className="text-foreground/70 text-sm font-serif">
                  Some roles give unreliable info. The demon's team creates chaos. 
                  You're solving a puzzle where pieces don't always fit.
                </p>
              </div>

              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                  <Skull className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-blue-300 mb-2">Dead players stay in</h3>
                <p className="text-foreground/70 text-sm font-serif">
                  You can still talk, and you get one final vote to use anytime 
                  before the game ends.
                </p>
              </div>

              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-purple-300 mb-2">The Storyteller plays too</h3>
                <p className="text-foreground/70 text-sm font-serif">
                  They're not just a facilitator. They balance the game and sometimes 
                  feed misinformation through certain abilities.
                </p>
              </div>
            </div>
          </Card>
        </motion.section>

        <motion.section 
          {...fadeInUp}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-500 font-display text-center mb-6">Your Role</h2>
          
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="townsfolk" className="border-amber-900/30 bg-card/60 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline" data-testid="accordion-townsfolk">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="font-semibold text-blue-300">Townsfolk</span>
                  <span className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-full">Good</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 font-serif pb-4">
                You're on the good team with helpful abilities to gather information or protect others. 
                Use your power wisely to help the town find and execute the demon.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="outsiders" className="border-amber-900/30 bg-card/60 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline" data-testid="accordion-outsiders">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-600/30 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="font-semibold text-cyan-300">Outsiders</span>
                  <span className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-full">Good</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 font-serif pb-4">
                You're on the good team, but your abilities hinder the town in some way. 
                Despite this drawback, you still want good to win.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="minions" className="border-amber-900/30 bg-card/60 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline" data-testid="accordion-minions">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-600/30 flex items-center justify-center">
                    <Target className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="font-semibold text-orange-300">Minions</span>
                  <span className="text-xs bg-red-900/40 text-red-300 px-2 py-0.5 rounded-full">Evil</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 font-serif pb-4">
                You know who the demon is. Your job is to protect them and spread misinformation 
                to confuse the good team.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="demons" className="border-amber-900/30 bg-card/60 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline" data-testid="accordion-demons">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600/30 flex items-center justify-center">
                    <Skull className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="font-semibold text-red-300">Demons</span>
                  <span className="text-xs bg-red-900/40 text-red-300 px-2 py-0.5 rounded-full">Evil</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 font-serif pb-4">
                You're the main villain. Kill each night and avoid execution at all costs. 
                If the town executes you (usually), good wins.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.section>

        <motion.section 
          {...fadeInUp}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-500 font-display text-center mb-6">Quick Tips</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-blue-950/30 border-blue-900/30 p-6">
              <h3 className="font-semibold text-blue-300 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                If You're Good
              </h3>
              <ul className="space-y-3 text-foreground/80 font-serif text-sm">
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Share information—the town needs data</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Ask questions and look for contradictions</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Trust but verify—info can be wrong</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Take notes to track claims</span>
                </li>
              </ul>
            </Card>

            <Card className="bg-red-950/30 border-red-900/30 p-6">
              <h3 className="font-semibold text-red-300 mb-4 flex items-center gap-2">
                <Skull className="w-5 h-5" />
                If You're Evil
              </h3>
              <ul className="space-y-3 text-foreground/80 font-serif text-sm">
                <li className="flex gap-2">
                  <span className="text-red-400">•</span>
                  <span>Blend in and act like a good player</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">•</span>
                  <span>Pick a believable claim from your bluffs</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">•</span>
                  <span>Protect the demon by casting suspicion elsewhere</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">•</span>
                  <span>Sow doubt about good information</span>
                </li>
              </ul>
            </Card>
          </div>
        </motion.section>

        <motion.section 
          {...fadeInUp}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-br from-amber-950/40 to-amber-900/20 border-amber-700/30 p-6 md:p-8 text-center">
            <h2 className="text-2xl font-bold text-amber-400 font-display mb-4">First Game Mindset</h2>
            <p className="text-foreground/90 font-serif text-lg leading-relaxed max-w-2xl mx-auto mb-4">
              Don't try to play optimally. Talk to people, pay attention to claims, and enjoy the mystery.
            </p>
            <p className="text-amber-100/60 font-serif italic">
              Ask the Storyteller anything—rules, abilities, what just happened. 
              They're there so you can focus on deduction, not mechanics.
            </p>
          </Card>
        </motion.section>

        <motion.section 
          {...fadeInUp}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <p className="text-lg text-amber-100/70 mb-6 font-serif">Ready to play?</p>
          <Link href="/reference">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white" data-testid="button-goto-codex">
              <BookOpen className="w-5 h-5 mr-2" />
              Explore the Character Reference
            </Button>
          </Link>
        </motion.section>
      </div>
    </Layout>
  );
}
