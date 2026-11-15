import type {DemoScenarioKey} from './demo-scenarios';

// The exact pre-S200 wording for scenario version one. This is retained only
// to bind a one-time, reversible correction to the published stage text.
export const preS200StageUpdates:Readonly<Record<DemoScenarioKey,readonly string[]>>={
  "fresh-food-batch": [
    "The current example food batch is available for inquiries within its short dispatch window.",
    "The example food batch remains available within the stated short dispatch window.",
    "The current example food batch has limited supply; the reduced capacity and short dispatch window apply.",
    "The next example food batch is being prepared for the next short supply window.",
    "The replacement example food batch is being checked before the next availability window opens.",
    "The next example food batch is available; normal capacity and the short dispatch window are restored."
  ],
  "food-preparation": [
    "The example kitchen has preparation capacity for new food orders within the stated short lead time.",
    "The next example kitchen batch is scheduled; fewer new orders fit within the current preparation window.",
    "The example kitchen batch is being prepared; new orders remain subject to limited preparation capacity.",
    "The current example kitchen batch is being packed; the longer new-order preparation window still applies.",
    "The next example kitchen allocation is being planned; preparation slots remain limited.",
    "The next example kitchen allocation is open; normal preparation capacity and the shorter lead time are restored."
  ],
  "production-cycle": [
    "The production team has open capacity for new orders.",
    "The next production batch is scheduled; reduced capacity and the longer new-order lead time apply.",
    "The production batch is in progress; new orders remain subject to the stated limited capacity.",
    "The current production batch is being finished; the longer lead time still applies to new orders.",
    "The next production allocation is being planned; new-order capacity remains limited.",
    "The next production allocation is open; normal capacity and the shorter lead time are restored."
  ],
  "seasonal-harvest": [
    "The next example harvest is being prepared; quantities are not yet ready for dispatch.",
    "The upcoming example harvest is being checked before the supply window opens.",
    "The example harvest is now available for wholesale inquiries within the stated supply capacity.",
    "The current example harvest remains available for dispatch within the stated lead time.",
    "The example supply window is narrowing; capacity is lower and the predefined seasonal price applies.",
    "The next example supply window has opened; normal capacity and pricing are restored."
  ],
  "workshop-production": [
    "The example workshop has open production slots at its normal capacity.",
    "The next production run is scheduled; fewer new-order slots and the longer lead time apply.",
    "The example workshop run is in progress; new orders remain subject to limited capacity.",
    "The current example run is being finished; the published new-order lead time still applies.",
    "The next example capacity allocation is being planned; new-order slots remain limited.",
    "The next example allocation is open; normal capacity and the shorter new-order lead time are restored."
  ],
  "wholesale-replenishment": [
    "The current example wholesale batch is available at the stated minimum order and dispatch time.",
    "The example batch remains available through its regular dispatch window.",
    "The current example batch has limited supply; the reduced capacity applies.",
    "The next example batch is being prepared and is not yet ready for dispatch.",
    "The replacement example batch is being checked before the next availability window.",
    "The next example batch is available; normal capacity and dispatch time are restored."
  ]
};

export const preS200LeadTimes:Readonly<Record<string,string>>={
 'Next food batch in 1–2 working days':'Next example food batch in 1–2 working days',
 'Next harvest in 5–7 days':'Next example harvest in 5–7 days',
 'Next batch in 7–10 days':'Next example batch in 7–10 days',
};
