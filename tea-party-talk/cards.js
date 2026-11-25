const CARDS = [
  {
    id: 'red-cup', category: 'easy', categoryLabel: 'Start here',
    title: 'The red cup',
    tip: 'Let her point first. Each guest gets a different question, so nobody has to copy an answer.',
    alt: 'Teddy with a blue cup and Bunny with a red cup at a tea table',
    prompts: [
      'Who has the red cup?',
      'What color is Teddy’s cup?',
      'Which cup would you choose?',
      'What drink should we pour?',
      'Who is sitting next to Bunny?',
      'What can we say before we drink together?',
      'Where should we put the cups after tea?',
      'What snack would go with our drinks?'
    ]
  },
  {
    id: 'apple-choice', category: 'easy', categoryLabel: 'Start here',
    title: 'Apple for a guest',
    tip: 'Either apple is a good choice. Pointing counts; wait quietly before offering the choices again.',
    alt: 'A red apple and a green apple on two plates',
    prompts: [
      'Which apple would you serve: red or green?',
      'Which apple looks crunchier to you?',
      'What shape are the apples?',
      'Who should get the first slice?',
      'Which apple should Bunny try?',
      'How many apples can you see?',
      'What could we make with these apples?',
      'What can we say when someone serves us an apple?'
    ]
  },
  {
    id: 'hiding-cat', category: 'easy', categoryLabel: 'Start here',
    title: 'Hide and seek',
    tip: 'Accept “there,” a point, or a full sentence. You can model “Cat is under the table.”',
    alt: 'An orange cat peeking out from under a tea table',
    prompts: [
      'Where is Cat?',
      'What color is Cat?',
      'What is Cat hiding under?',
      'Where is Cat’s tail?',
      'What might Cat say?',
      'Where should Cat hide next?',
      'How can we call Cat over?',
      'What should we serve Cat?'
    ]
  },
  {
    id: 'tea-snack', category: 'easy', categoryLabel: 'Start here', imageType: 'jpg',
    title: 'At the market',
    tip: 'Start with foods she knows. Any food answer works; this is not a lesson about healthy choices.',
    alt: 'A colorful market display of peppers, cucumbers, greens, and other vegetables',
    prompts: [
      'What should we buy for our tea party?',
      'Can you name a red food?',
      'Which food is yellow?',
      'Where are the cucumbers?',
      'Which vegetable should we put in soup?',
      'Which food would Teddy like?',
      'Which food would you like to taste?',
      'What can we say to the shopkeeper?'
    ]
  },
  {
    id: 'rainy-walk', category: 'easy', categoryLabel: 'Start here', imageType: 'jpg',
    title: 'Rain at the window',
    tip: 'Try “boots or umbrella?” if an open question is hard. A point to either one is a complete answer.',
    alt: 'Raindrops on a window with colorful city lights outside',
    prompts: [
      'What can you see on the window?',
      'Where are the raindrops?',
      'What do we need for a rainy walk?',
      'What colors can you see in the lights?',
      'What sound does the rain make?',
      'Who should hold the umbrella?',
      'Would you jump in a puddle or walk around it?',
      'What should we do when we come home wet?'
    ]
  },
  {
    id: 'field-leaf', category: 'easy', categoryLabel: 'Start here',
    title: 'Field trip find',
    tip: 'Connect this to something she really saw. You can answer first with one short sentence.',
    alt: 'A child discovering a red leaf and a small snail on a nature path',
    prompts: [
      'What can you find on our nature walk?',
      'What color is the leaf?',
      'Who is looking at the leaf?',
      'Which is smaller: the snail or the leaf?',
      'How does a snail move?',
      'Where do you think the snail is going?',
      'What else could we find nearby?',
      'What should we say to our nature guide?'
    ]
  },
  {
    id: 'spilled-tea', category: 'feelings', categoryLabel: 'Feelings and friends',
    title: 'Oops, spilled tea',
    tip: 'Accept practical answers and feeling answers: “get a towel,” “say sorry,” or “feel sad.”',
    alt: 'A worried teddy bear beside a tipped cup and spilled tea',
    prompts: [
      'What happened to Teddy’s tea?',
      'How does Teddy feel?',
      'What could Teddy do next?',
      'Who could help Teddy?',
      'What could we use to clean up?',
      'What could we say to Teddy?',
      'What could Teddy say to Bunny?',
      'How might Teddy feel after it is clean?'
    ]
  },
  {
    id: 'crying-bear', category: 'feelings', categoryLabel: 'Feelings and friends',
    title: 'Baby Bear is crying',
    tip: 'All plausible feelings are welcome. You can offer one word: “Do you think sad or angry?”',
    alt: 'A small crying bear with an older bear sitting beside it',
    prompts: [
      'How does Baby Bear feel?',
      'Who is sitting with Baby Bear?',
      'What might have made Baby Bear cry?',
      'What could the older bear do?',
      'What could we say to Baby Bear?',
      'Should we offer a hug or a little space?',
      'What helps you when you feel sad?',
      'What could Baby Bear do after calming down?'
    ]
  },
  {
    id: 'pink-balloon', category: 'feelings', categoryLabel: 'Feelings and friends', imageType: 'jpg',
    title: 'Balloon party',
    tip: 'Let each guest choose differently. If sharing comes up, a request works better than grabbing.',
    alt: 'Many colorful balloons floating above their strings',
    prompts: [
      'Which balloon would you choose?',
      'What colors can you find?',
      'Which balloon looks highest?',
      'Which balloon should Teddy have?',
      'How do balloons make you feel?',
      'What could you say if you wanted a friend’s balloon?',
      'What game could we play with one balloon?',
      'How should we carry our balloons home?'
    ]
  },
  {
    id: 'broken-tower', category: 'feelings', categoryLabel: 'Feelings and friends', imageType: 'jpg',
    title: 'Bricks everywhere',
    tip: 'There is no single correct build. If frustration comes up, offer a body outlet rather than a lecture.',
    alt: 'A colorful pile of building bricks in many shapes and sizes',
    prompts: [
      'What could we build with these bricks?',
      'Which color brick would you pick first?',
      'Can you find a long brick?',
      'How would you feel if your tower fell?',
      'What could you do with angry feelings?',
      'Who could help you rebuild?',
      'What could we say while we build together?',
      'How high should our next tower be?'
    ]
  },
  {
    id: 'new-friend', category: 'feelings', categoryLabel: 'Feelings and friends',
    title: 'A new guest',
    tip: 'A wave counts. Let her practise for a stuffed animal if speaking for herself feels too big.',
    alt: 'A teddy and bunny waving to a small fox joining their tea party',
    prompts: [
      'Who is joining our party?',
      'How can we say hello?',
      'What could Teddy tell Fox about himself?',
      'Would you wave, smile, or use words?',
      'What drink could we offer Fox?',
      'How can we help Fox feel welcome?',
      'Where should Fox sit?',
      'What could we play together?'
    ]
  },
  {
    id: 'sharing-cookies', category: 'feelings', categoryLabel: 'Feelings and friends', imageType: 'jpg',
    title: 'Cookies to share',
    tip: 'There is no single correct answer. Breaking cookies, taking turns, or finding another snack all work.',
    alt: 'Chocolate chip cookies on baking paper, with one cookie broken into pieces',
    prompts: [
      'What can you see on the baking paper?',
      'What is inside these cookies?',
      'How could we share one cookie?',
      'Who should take the first piece?',
      'What can we say when we offer a piece?',
      'What drink would go with a cookie?',
      'What could we do if someone wants more?',
      'How will we know when everyone is finished?'
    ]
  },
  {
    id: 'magic-animal', category: 'imagine', categoryLabel: 'Imagine and tell',
    title: 'Magic tea',
    tip: 'You answer first if needed. “I am a sleepy cat” gives her a pattern without demanding a copy.',
    alt: 'A sparkling tea cup surrounded by a cat, rabbit, bird, and tiny stars',
    prompts: [
      'The magic tea turns you into an animal. Which animal are you?',
      'What color is the magic tea?',
      'Where are the sparkles?',
      'What sound does your animal make?',
      'Where does your animal live?',
      'What does your animal like to eat?',
      'What is your animal’s name?',
      'How will you turn back into yourself?'
    ]
  },
  {
    id: 'flying-cup', category: 'imagine', categoryLabel: 'Imagine and tell',
    title: 'A flying teacup',
    tip: 'Any destination works. Follow her answer only if she is enjoying the exchange.',
    alt: 'A giant flying tea cup carrying Teddy and Bunny above small houses',
    prompts: [
      'Our teacup can fly. Where should we go?',
      'Who is riding in the cup?',
      'What color is our flying cup?',
      'What can we see below us?',
      'How does the cup move?',
      'Where should we land?',
      'What should we bring on our trip?',
      'How will we get home?'
    ]
  },
  {
    id: 'tiny-door', category: 'imagine', categoryLabel: 'Imagine and tell',
    title: 'The tiny door',
    tip: 'Point to details: “Do you see the tiny window?” Accept one word, a sound, or a made-up name.',
    alt: 'A tiny red door and round window in the trunk of a large tree',
    prompts: [
      'Who lives behind this tiny door?',
      'What color is the door?',
      'What shape is the window?',
      'What can we say when we knock?',
      'Who opens the door?',
      'What does the house look like inside?',
      'What could we serve our tiny host?',
      'How should we say goodbye?'
    ]
  },
  {
    id: 'moon-picnic', category: 'imagine', categoryLabel: 'Imagine and tell',
    title: 'Picnic on the moon',
    tip: 'Silly answers are welcome. Let each guest build a different part of the moon picnic.',
    alt: 'Teddy and Bunny having a picnic on the moon with Earth in the sky',
    prompts: [
      'What food should we take to the moon?',
      'Where are Teddy and Bunny?',
      'What color is the picnic blanket?',
      'What can we see in the sky?',
      'How will we carry the food?',
      'Who should pour the moon tea?',
      'What game could we play on the moon?',
      'How will we get back home?'
    ]
  },
  {
    id: 'talking-teddy', category: 'imagine', categoryLabel: 'Imagine and tell',
    title: 'Teddy wakes up',
    tip: 'Let her answer for Teddy in any voice or language. Do not ask her to make it louder.',
    alt: 'A surprised child listening to a teddy bear sitting up in bed',
    prompts: [
      'Your teddy can suddenly talk. What does Teddy say first?',
      'Where is Teddy sitting?',
      'Who is listening to Teddy?',
      'How does the child feel?',
      'What question would you ask Teddy?',
      'What does Teddy like to eat?',
      'What game should we play with Teddy?',
      'What bedtime story should Teddy tell?'
    ]
  },
  {
    id: 'cloud-shapes', category: 'imagine', categoryLabel: 'Imagine and tell', imageType: 'jpg',
    title: 'Cloud watching',
    tip: 'There is no wrong picture in a cloud. Let every guest see something different.',
    alt: 'Large gray and white clouds moving across the sky',
    prompts: [
      'What does this cloud look like to you?',
      'What colors are in the sky?',
      'Which cloud looks biggest?',
      'What might happen next in the weather?',
      'What should we take outside with us?',
      'Where do you think the clouds are going?',
      'How do these clouds make you feel?',
      'What would you draw in the sky?'
    ]
  }
];
