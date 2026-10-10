High level non-functional specs
- web based app - mobile first - paramount! (desktop version is not even necessary for the demo)
- the app will be presented during a hackaton. It should be working, having AI features (backend and/or frontend)
- it will be live demo-ed to a 10-15 audience, during 2-3 minutes
- emphasis should be ease of use, streamlined design, clear user flows 
- the real world problem we want to solve:
    - you are going to an event and you don't know anyone 
    - as an introvert it is difficult to talk to people - difficult to break the ice
- the main point is to encourange the atendees "breaking the ice", interact with each other after finishing
the flow

High level functional specs
  - QR code is an entry point
    - QR code embeddes the app web URL
  - once the user enters the app, we show a 2-3 seconds intro animation that gets them in the flow
  - after the animation, the user is promoted to input his name, and can click continue
  - then, you get 20-30 seconds to fill in a questinnaire
    - few questions (4-5), multiple choice, predefined answers
    - the questions should be easy, funny - examples: (do you like Julio Iglesios)
    - the questions and the answers will be pre-filled answers (50+ funny questions database)
        - each question has a theme (there will be 15-20 themes, e.g. akwards, food, friendship) and the answers have a trait
        - the questions are already generated in the repository: [questions.test.json](tools/src/questions/questions.test.json)
        - schemas: [QuestionList.ts](tools/src/questions/QuestionList.ts), [Themes.ts](tools/src/questions/Themes.ts), [Traits.ts](tools/src/questions/Traits.ts)
    - there will be a 20-30 seconds timer and a progress bar on top
    - if the seconds are passing, the user is still allowed to finish the questionnaire
    - after finishing, he will be prompted to a screen which calls for a CTA to reveal his colour, to create some suspense
  - an algoritm will compute the answers (we might use Jev to get some weights on the traits) and assign 4 colours
    - the algorithm will always have a bias towards equally distrubuting people
        - e.g. if someone is 50% red, 50% blue, but there are already too many reds, it will assign it to blue
   - based on ppl anwsers,there will be ONE ice-breaker for the night
        - example ice-breakers (each with a theme and 1-3 traits): [icebreakers.test.json](tools/src/icebreakers/icebreakers.test.json), schema: [IcebreakerList.ts](tools/src/icebreakers/IcebreakerList.ts)
   - TBD:
        - how and WHEN the algoritm will select the ice breaker
        - for the demo, we can ask ppl to anwers before the demo    
   - the app then will reveal your color and a short description of the color
   - the next screen will show progress and color distribution
   - when finished, it will show the ice breaker
   - it will also encourage people turning their phone in a led-scroller like application, becoming full screen with his name, "ask me anything", and potentially use the phone as a badge

Nice to have:
    - a % match with each person and an indivudla ice-breaker recommmended by the algoritm for each person
    - enocurage people going to the same place in 2 minutes (e.g. beer corner) - for demo, we can sketch a map of the location
    - some people might know someone already - we can leverage that to introduce to other people
