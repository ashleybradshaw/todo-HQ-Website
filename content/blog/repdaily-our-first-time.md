---
title: "RepDaily: counting was the easy part"
authorId: "grow-04"
date: "2026-09-17"
readMinutes: 4
emoji: "📱"
slug: "repdaily-our-first-time"
excerpt: "RepDaily started as a camera push-up counter. The counting worked. The hard part was getting people to come back tomorrow. How two of us built that."
category: projects
featured: true
hero: "/blog/repdaily-our-first-time.webp"
ogImage: "/blog/repdaily-our-first-time.webp"
imageAlt: "Two women doing push-ups behind RepDaily on two phones, showing PushPass tracking and achievements in the lime brand frame."
series: "Factory log"
tags: "repdaily, push-up tracking, computer vision, build log"
status: mock
editor: ashley
---

We wanted a phone on the floor to count push-ups properly. It could. But a counter is the kind of app you open twice and then forget, so the real work on RepDaily turned out to be the part a demo never shows: giving someone a reason to come back tomorrow. Here's how two of us, one designer and one engineer, built that in 103 days, and what has changed on the way to v1.5.

## The brief we thought we had

The push-up is about as basic as exercise gets, and tracking it was oddly clumsy. You either stopped mid-set to tap a sweaty screen, or trusted a watch that had no real idea whether your chest went anywhere near the floor.

So the opening question was narrow. Could the front camera of a phone, lying face up on the floor, count a clean rep with nobody touching it? Full depth, full extension, every time.

[NEEDS: the first time the camera counted a real rep, where you were, and what broke just before it worked]

> NOTE
> **Checkpoint 1 of 5 · findMoment.** Passed: a phone on the floor can count a clean push-up. Flagged: a counter on its own keeps nobody.

## The brief we actually had

A number on a screen is satisfying once. It doesn't get you off the sofa on day nine. So before anything looked polished, the designer mapped flows: first launch and signup, the daily session, progression, the free and paid dashboards, and how the app should behave across months rather than minutes.

Underneath all of it sits one loop. Open it, train, see what you did, see how far you've come, return tomorrow. Streaks, stages, points and badges are there to push someone round that loop one more time.

We also decided early that the free version had to be a proper app, not a trailer for the paid one. Pro would add structure and stakes, not switch the basics back on.

The brand went loud lime from early on. It is very hard to scroll past, which was rather the idea.

## 103 days, then real people

From the first question to a launch-ready app took 103 days. That covered more than 40 screens across iOS and Android, a design system built in code, and the unglamorous rest: the brand, a website, the CRM and everything a launch needs.

The split was clean. The designer owned the flows, the screens, every word of copy, the brand and the site. The engineer owned the tracking, the workout logic, the points system, the rules for how momentum fades when you skip days, and the cross-platform build.

AI tools did real work, and we still made the calls. That's [how we work](/about) on everything. Rather than draw wireframes, we tried interaction states and edge cases as small live builds in Cursor. Claude Code helped on the engineering side. Image prompts were tuned until marketing shots came out on brand, with consistent light and angles.

Then we handed it to a beta group, a mix of personal trainers and some of our first users, and ran structured feedback rounds. What they told us changed the setup flow and the order of the dashboard. Setup is now a short step before your first camera workout, and then it gets out of the way.

[NEEDS: one specific thing a trainer or beta user said, and what we changed because of it]

> NOTE
> **Checkpoint 3 of 5 · shipMvp.** 103 days. 40+ screens. Two platforms. Rep counting runs on the phone itself: nothing recorded, nothing uploaded.

## v1.5: what's free, what Pro adds

v1.5 went out on Product Hunt with one ask: tell us what you think of the tracking and the flow. You can try it at [repdaily.app](https://repdaily.app).

Free covers open FreeRep sessions with camera counting, plus basic streaks and workout history. Every rep, in every mode, banks into PowerPath 10K: a 10,000-rep lifetime target with no daily minimum, ranked from Couch Potato to Absolute Unit.

Pro adds PushPass 24, a run of 24 stages that starts at beginner rep ranges, and UltraTasks. Explosive 20 is twenty clean reps against the clock. Max Load is everything you've got in 60 seconds. There's a 17-badge trophy cabinet too, and a 7-day free trial.

The whole app is under 2.9 MB, and the computer vision runs entirely on the phone.

[NEEDS: confirm active users and paid conversion, with the date, or cut this line]

> NOTE
> **Checkpoint 5 of 5 · parkOrPush.** Our rule: park a product unless people use it. RepDaily got pushed to v1.5.

## Next run

Next on the RepDaily roadmap: training with friends, shared challenges, and local and global leaderboards, planned for late 2026. Same loop, more reasons to come back.

See the full build, stack and screens on the [RepDaily project page](/work/repdaily).
