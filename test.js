let voteRound = {
  "quesiton 1": [
    {
      name: 'a',
      color: 'red',
      answer: 'a'
    },
    {
      name: 'a',
      color: 'red',
      answer: 'a'
    }
  ]
}

let voteObj = {
  code: code,
  question: game.questions[0],
  answers: [
    {
      name: 'a',
      color: 'red',
      answer: 'a'
    },
    {
      name: 'a',
      color: 'red',
      answer: 'a'
    }
  ],
  round: 0
}

let Game = {
  code: 'AAAA',
  questions: [
    'What\'s your favorite color? 0',
    'What\'s your favorite movie? 5',
    'What\'s your favorite show? 7',
    'What\'s your favorite food? 1',
    'What\'s your favorite song? 4',
    'What\'s your favorite book? 2',
    'What\'s your favorite sport? 3',
    'What\'s your favorite game? 6'
  ],
  questionText: [
    { key: '0', text: 'What\'s your favorite color? 0' },
    { key: '1', text: 'What\'s your favorite food? 1' },
    { key: '2', text: 'What\'s your favorite book? 2' },
    { key: '3', text: 'What\'s your favorite sport? 3' },
    { key: '4', text: 'What\'s your favorite song? 4' },
    { key: '5', text: 'What\'s your favorite movie? 5' },
    { key: '6', text: 'What\'s your favorite game? 6' },
    { key: '7', text: 'What\'s your favorite show? 7' }
  ],
  players:
  {
    a: {
      socketId: 'RDwsVkR7P7oVE7ahAAAT',
      name: 'a',
      color: 'red',
      points: 0,
      questions: [Array],
      answers: [Array]
    },
    s: {
      socketId: 'OZv7ckq-MIpABusjAAAU',
      name: 's',
      color: 'orange',
      points: 0,
      questions: [Array],
      answers: [Array]
    },
    d: {
      socketId: 'aqBP6Uaax5TyH6vYAAAV',
      name: 'd',
      color: 'yellow',
      points: 0,
      questions: [Array],
      answers: [Array]
    },
    f: {
      socketId: 'IeBK1y2Lsnld_ppSAAAW',
      name: 'f',
      color: 'lime',
      points: 0,
      questions: [Array],
      answers: [Array]
    },
    q: {
      socketId: '5PJ5Gw_iNveKpOuKAAAX',
      name: 'q',
      color: 'green',
      points: 0,
      questions: [Array],
      answers: [Array]
    },
    w: {
      socketId: 'bwALUDaXlJOxG9qAAAAY',
      name: 'w',
      color: 'blue',
      points: 0,
      questions: [Array],
      answers: [Array]
    },
    e: {
      socketId: 'f-nZ8fyQSPjSq0OTAAAZ',
      name: 'e',
      color: 'indigo',
      points: 0,
      questions: [Array],
      answers: [Array]
    },
    r: {
      socketId: '5tyRyRNu4ARvehabAAAa',
      name: 'r',
      color: 'violet',
      points: 0,
      questions: [Array],
      answers: [Array]
    }
  },
  playerNames: ['a', 's', 'd', 'f', 'q', 'w', 'e', 'r'],
  colors:
  {
    red: false,
    orange: false,
    yellow: false,
    lime: false,
    green: false,
    blue: false,
    indigo: false,
    violet: false
  }
}
