---
title: "ReadyGo: the ten minutes before you go"
authorId: "grow-04"
date: "2026-09-24"
readMinutes: 4
emoji: "🚴"
slug: "readygo-deep-dive"
excerpt: "ReadyGo plans your run or ride before you head out: route, conditions and effort, sorted in minutes. How we built it, and everything we left out."
category: projects
hero: "/blog/readygo-deep-dive.webp"
ogImage: "/blog/readygo-deep-dive.webp"
imageAlt: "A cyclist and a runner on an empty mountain road under the line Take it out on the road, framed by an aerial view of forest."
series: "Factory log"
seriesNumber: "02"
tags: "readygo, run and ride planning, route planner, build log"
status: mock
editor: ashley
---

Most fitness apps start when you press go, and they are very good at what comes next: splits, heart rate, who gave you kudos. But the hardest part of a run or a ride is often the bit before it, kit half on, flicking between a weather app and the clock. So our second product lives there. ReadyGo plans the session for you, so the only decision left is the door.

## The minutes nobody designs for

Picture the window. You've got a gap, and a queue of small questions arrives with it. Is it dry? Which way? Is there enough light left? Will I be back in time? None of them is hard. Together they are often enough to keep you on the sofa.

That stretch of dithering is the whole product. Its own tagline says what it isn't: "It's not a coach. It's not a tracker." Its job is to answer the questions before they win.

> NOTE
> **Checkpoint 1 of 5 · findMoment.** The ten or so minutes before a run or ride, when the questions pile up. Most sports apps only wake up at the start button.

## One job, and a long list of no

ReadyGo could easily have grown into weather, routing, nutrition, kit, tracking and social, all at once. The real design work was refusing. The MVP got one job: build a session plan quickly enough that checking it turns into habit rather than a chore. Every screen had to earn its place against that.

You set up a profile once: run or ride, the weather you'll put up with, the terrain you like, where you usually start. The engine behind it, which we call GOAI, then builds a session with a route, the conditions and an effort level. It looks at the forecast, how much daylight is left and the ground underfoot, stretches or shrinks the loop to fit your time, and starts from your GPS position or a postcode. Loop or point to point, your choice.

Just as deliberate is what's missing. No setup wizard, no social feed, no public leaderboards. Guest mode lets you plan a route before you make an account, and everything is free. Nobody overtakes you on a leaderboard while you're still looking for your other sock.

> NOTE
> **Checkpoint 2 of 5 · checkMarket.** Plenty of apps track the session. We built for the minutes before it and kept everything else out.

## Second run, faster line

If you read the [RepDaily log](/blog/repdaily-our-first-time), you know the shape: same two of us, one designer and one engineer. ReadyGo was where we tested how far that lean, AI-assisted way of working would stretch.

The big change was running design and build side by side instead of one after the other. The design system lives in Figma, with tokens for size, spacing, colour, motion and layout set up so they translate cleanly into code. Rough components went straight into coded sandboxes through Cursor and Claude Code, so we could poke at states, loading and edge cases in something real. A handover cycle that normally eats a week took a day.

The numbers from that run: full screen design in two days, and feature prototypes testers could use in a day and a half. Gemini and Claude helped with ideas and copy, and Linear kept the tasks honest. That's [how we work](/about) generally: tools do the legwork, people make the calls.

The imagery came from Adobe Firefly: twenty stills and five short videos, all of people getting ready rather than people already moving. The brand needed to live where the app lives.

> NOTE
> **Checkpoint 3 of 5 · shipMvp.** Screens in two days. Testable prototypes in a day and a half. A working MVP in front of real testers.

## In testers' hands

Then we slowed down on purpose. A small group of eight early users spent four weeks in a structured round of usability testing on Android and iOS, covering onboarding, plan generation, how usable the routes are, and whether people come back. Feedback is gathered inside the app, tied to the screen and stage it came from, plus video interviews and hands-on sessions with the prototypes.

[NEEDS: one thing a tester did or said that changed the app, and what we changed]

> NOTE
> **Checkpoint 4 of 5 · buildInPublic.** Kept small and structured for now. The full build in public phase opens once the beta reaches its user target.

[NEEDS: confirm current status: beta version, Android and iOS availability, and whether the user target has been reached]

## Next run

The roadmap on the ReadyGo site runs from personal bests and micro challenges in late 2026, to community milestones in early 2027, to shared routes and group sessions in mid 2027. Before any of that, the beta has to show people keep coming back.

> NOTE
> **Checkpoint 5 of 5 · parkOrPush.** Not called yet. The testers get the deciding vote.

See where it's up to on the [ReadyGo project page](/work/readygo).
