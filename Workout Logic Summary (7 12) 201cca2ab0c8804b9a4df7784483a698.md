# Workout Logic Summary (7/12)

<aside>
🚨

*Changed multiplier to 3.2 on 6/17

*Changed multiplier to 3.0 on 7/1

*Changed multiplier to 2.6 on 7/12

</aside>

### **1. Workout Structure**

- Each workout = **8 sets**
- **2 minutes rest** between each set
- **Total pull-ups per workout = `2.6 × current pull-up max`**
- Each set's rep count varies; rep distribution pattern is **randomized from a predefined set of schemes** (see #7)

---

### 2. **Progression System**

- Each cycle = **8 workouts**
- **Workouts 1–7**: total pull-up volume increases linearly from `2.6 × max` to `3.0 × max`
- **Workout 8**: test **max strict pull-ups** (bodyweight, or assisted/weighted depending on tier)
- New cycle recalculates workout volume based on new max

---

### 4. **High-End Adaptation (Max ≥ 40)**

- When bodyweight max ≥ 40, the workout exceeds 20-minute cap
- Switch to **weighted pull-ups**, adding 10–20% of bodyweight
- Test new **weighted max**, and calculate workouts using `2.6 × weighted max`
- Alternate test types every other cycle:
    - Cycle 1 test = weighted max
    - Cycle 2 test = bodyweight max

---

### 5. **Low-End Adaptation (Max ≤ 7)**

- Standard volume too low and % increase to next max too high
- Use **band-assisted pull-ups**, starting with assistance that enables ~16 pull-ups
- Treat assisted 16-rep max as baseline and apply standard progression logic
- Once assisted max reaches 22, **reduce assistance** to bring max back to 16 and continue cycle
- Repeat until user can perform ≥8 unassisted pull-ups

---

### 6. **Key Metrics to Track in App**

- **% increase to next max**:`((max + 1) - max) / max × 100`
- **% volume increase from Workout 1 → 7**:`((2.6 × (max + 2)) - (2.6 × max)) / (2.6 × max) × 100`

---

### 7. **Rep Distribution Patterns (Randomized Each Workout)**

App randomly selects one of the following patterns to distribute reps across 8 sets while ensuring total reps = target volume:

1. **Equal Sets** — same or near-same reps each set
2. **Descending** — high to low
3. **Ascending** — low to high
4. **Pyramid** — up then down
5. **Reverse Pyramid** — down then up
6. **Wave Loading** — alternating high/low
7. **Drop Sets** — first few high, taper off hard
8. **Ladder** — repeating sequences like 8-10-12-14
9. **Autoregulated Back-off** — reduce reps in later sets if failure risk detected

Rep ranges are constrained to avoid any single set exceeding 60% of the user's current max.

***Random note: we need both a total workout timer (tracking how long the workout takes to ensure it's under 20 min) and a 2 min timer in btwn sets

[Pullup Progression Table](https://www.notion.so/Pullup-Progression-Table-201cca2ab0c880e6be1cd2df839352c6?pvs=21)