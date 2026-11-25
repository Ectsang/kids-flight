const CARDS = [
  {
    id: 'red-cup', category: 'easy', categoryLabel: 'Start here',
    title: 'The red cup', question: 'Who has the red cup?',
    tip: 'Let her point first. If she points, say “Yes, Bunny has the red cup.” Do not ask her to repeat you.',
    alt: 'Teddy with a blue cup and Bunny with a red cup at a tea table'
  },
  {
    id: 'apple-choice', category: 'easy', categoryLabel: 'Start here',
    title: 'Apple for a guest', question: 'Which apple would you serve: red or green?',
    tip: 'Either answer is right. Pointing counts. Wait quietly before offering the two choices again.',
    alt: 'A red apple and a green apple on two plates'
  },
  {
    id: 'hiding-cat', category: 'easy', categoryLabel: 'Start here',
    title: 'Hide and seek', question: 'Where is Cat?',
    tip: 'Accept “there,” a point, or a full sentence. You can model “Cat is under the table.”',
    alt: 'An orange cat peeking out from under a tea table'
  },
  {
    id: 'tea-snack', category: 'easy', categoryLabel: 'Start here',
    title: 'Tea party shopping', question: 'What should we buy for our tea party?',
    tip: 'Start with foods she knows. Any food answer works; this is not a lesson about healthy choices.',
    alt: 'A shopping basket with bread, strawberries, milk, and a tea cup'
  },
  {
    id: 'rainy-walk', category: 'easy', categoryLabel: 'Start here',
    title: 'Rainy day', question: 'What do we need for a rainy walk?',
    tip: 'Try “boots or umbrella?” if an open question is hard. A point to either one is a complete answer.',
    alt: 'Yellow boots and a red umbrella beneath rain clouds'
  },
  {
    id: 'field-leaf', category: 'easy', categoryLabel: 'Start here',
    title: 'Field trip find', question: 'What can you find on our nature walk?',
    tip: 'Connect this to something she really saw today. You can answer first with one short sentence.',
    alt: 'A child discovering a red leaf and a small snail on a nature path'
  },
  {
    id: 'spilled-tea', category: 'feelings', categoryLabel: 'Feelings and friends',
    title: 'Oops, spilled tea', question: 'Teddy spilled his tea. What could he do next?',
    tip: 'Accept practical answers and feeling answers: “get a towel,” “say sorry,” or “feel sad.”',
    alt: 'A worried teddy bear beside a tipped cup and spilled tea'
  },
  {
    id: 'crying-bear', category: 'feelings', categoryLabel: 'Feelings and friends',
    title: 'Baby Bear is crying', question: 'How does Baby Bear feel?',
    tip: 'All plausible feelings are welcome. You can offer one word: “Do you think sad or angry?”',
    alt: 'A small crying bear with an older bear sitting beside it'
  },
  {
    id: 'pink-balloon', category: 'feelings', categoryLabel: 'Feelings and friends',
    title: 'The pink balloon', question: 'Teddy wants Bunny’s pink balloon. What could he say?',
    tip: 'Model a request, not a demand: “Can I have a turn?” Bunny can say no; that is allowed too.',
    alt: 'Bunny holding a pink balloon while Teddy looks at it'
  },
  {
    id: 'broken-tower', category: 'feelings', categoryLabel: 'Feelings and friends',
    title: 'The tower fell', question: 'The tower fell. What could Bunny do with her angry feelings?',
    tip: 'Offer a body outlet: stomp, squeeze a cushion, or say “Argh!” Practise these during calm play.',
    alt: 'A frustrated bunny beside a fallen tower of colorful blocks'
  },
  {
    id: 'new-friend', category: 'feelings', categoryLabel: 'Feelings and friends',
    title: 'A new guest', question: 'A new friend joins our party. How can we say hello?',
    tip: 'A wave counts. Let her practise for a stuffed animal if speaking for herself feels too big.',
    alt: 'A teddy and bunny waving to a small fox joining their tea party'
  },
  {
    id: 'sharing-cookies', category: 'feelings', categoryLabel: 'Feelings and friends',
    title: 'Two cookies, three guests', question: 'How can three friends share two cookies?',
    tip: 'There is no single correct answer. Breaking cookies, taking turns, or finding another snack all work.',
    alt: 'Three animal friends looking at two round cookies on a plate'
  },
  {
    id: 'magic-animal', category: 'imagine', categoryLabel: 'Imagine and tell',
    title: 'Magic tea', question: 'The magic tea turns you into an animal. Which animal are you?',
    tip: 'You answer first if needed. “I am a sleepy cat” gives her a pattern without demanding a copy.',
    alt: 'A sparkling tea cup surrounded by a cat, rabbit, bird, and tiny stars'
  },
  {
    id: 'flying-cup', category: 'imagine', categoryLabel: 'Imagine and tell',
    title: 'A flying teacup', question: 'Our teacup can fly. Where should we go?',
    tip: 'Any destination works. Follow her answer with “What can we see there?” only if she is enjoying the exchange.',
    alt: 'A giant flying tea cup carrying Teddy and Bunny above small houses'
  },
  {
    id: 'tiny-door', category: 'imagine', categoryLabel: 'Imagine and tell',
    title: 'The tiny door', question: 'Who lives behind this tiny door?',
    tip: 'Point to details: “Do you see the tiny window?” Accept one word, a sound, or a made-up name.',
    alt: 'A tiny red door and round window in the trunk of a large tree'
  },
  {
    id: 'moon-picnic', category: 'imagine', categoryLabel: 'Imagine and tell',
    title: 'Picnic on the moon', question: 'What food should we take to the moon?',
    tip: 'Silly answers are welcome. Ask “How will we carry it?” if she wants another turn.',
    alt: 'Teddy and Bunny having a picnic on the moon with Earth in the sky'
  },
  {
    id: 'talking-teddy', category: 'imagine', categoryLabel: 'Imagine and tell',
    title: 'Teddy wakes up', question: 'Your teddy can suddenly talk. What does Teddy say first?',
    tip: 'Let her answer for Teddy in any voice or language. Do not ask her to make it louder.',
    alt: 'A surprised child listening to a teddy bear sitting up in bed'
  },
  {
    id: 'cloud-shapes', category: 'imagine', categoryLabel: 'Imagine and tell',
    title: 'Cloud watching', question: 'What does this cloud look like to you?',
    tip: 'There is no wrong picture in a cloud. You can share yours after she has time for her own idea.',
    alt: 'A child and teddy looking at a cloud shaped like a rabbit'
  }
];
