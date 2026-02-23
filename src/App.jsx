import { useState, useEffect, useMemo } from "react";

const GENEROS_LIST = ["Amor y familia","Autoayuda","Biología","Ciencia","Dinero y finanzas","Fantasía","Ficción","Filosofía","Física","Historia","Ingeniería","Lectura","Literatura","Memorias","Negocios","Poesía","Política","Productividad","Psicología","Realizamiento","Research","Romance","Salud","Work-life balance"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const FORMATOS = ["Ebook","Papel"];
const C = { darkCyan:"#033331", medCyan:"#0d3d3b", deepCyan:"#05af6a", medOrange:"#f8dfa9", paleOrange:"#f8f1e4", K:"#05af6a", P:"#f8dfa9" };

const SEED_LEIDOS = [
  {id:1,titulo:"Circe",autor:"Madelline Miller",generos:["Lectura"],formato:"Papel",personaje:9,prosa:8,trama:8,aprendizaje:3,entretenimiento:8.5,total:7.3,mesLeido:"Enero",paginas:448,lector:"P"},
  {id:2,titulo:"Slow productivity",autor:"Cal Newport",generos:["Productividad"],formato:"Ebook",personaje:6,prosa:7,trama:6,aprendizaje:9,entretenimiento:5,total:6.6,mesLeido:"Enero",paginas:256,lector:"P"},
  {id:3,titulo:"The top 5 regrets of the dying",autor:"Bronnie Ware",generos:["Filosofía"],formato:"Ebook",personaje:8,prosa:9,trama:9,aprendizaje:10,entretenimiento:7,total:8.6,mesLeido:"Febrero",paginas:245,lector:"P"},
  {id:4,titulo:"Danzante del filo",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],formato:"Ebook",personaje:9,prosa:7,trama:10,aprendizaje:4,entretenimiento:10,total:8,mesLeido:"Enero",paginas:150,lector:"P"},
  {id:5,titulo:"Todos nuestros ayeres",autor:"Natalia Ginzburg",generos:["Literatura"],formato:"Ebook",personaje:6,prosa:4,trama:4,aprendizaje:2,entretenimiento:5,total:4.2,mesLeido:"Enero",paginas:150,lector:"P"},
];

const SEED_BIBLIOTECA = [
  {id:101,titulo:"Sin límites",autor:"Jim Kwik",generos:["Realizamiento"],paginas:null},
  {id:102,titulo:"Start with no",autor:"Jim Camp",generos:["Negocios"],paginas:null},
  {id:103,titulo:"Never eat alone",autor:"Keith Ferrazzi",generos:["Amor y familia"],paginas:null},
  {id:104,titulo:"The minimalist entrepeneur",autor:"Sahil Lavingia",generos:["Negocios"],paginas:null},
  {id:105,titulo:"La caída de Númenor",autor:"J.R.R.Tolkien",generos:["Ficción","Fantasía"],paginas:null},
  {id:106,titulo:"Atrévete a no gustar",autor:"Fumitake Koga",generos:["Autoayuda"],paginas:null},
  {id:107,titulo:"Predictably irrational",autor:"Dan Ariely",generos:["Psicología"],paginas:null},
  {id:108,titulo:"Anything you want",autor:"Derek Sivers",generos:["Negocios"],paginas:null},
  {id:109,titulo:"The 4-hour body",autor:"Tim Ferriss",generos:["Salud"],paginas:null},
  {id:110,titulo:"Miracle morning",autor:"Hal Elrod",generos:["Productividad"],paginas:null},
  {id:111,titulo:"The science of getting rich",autor:"Wallace Wattles",generos:["Dinero y finanzas"],paginas:null},
  {id:112,titulo:"Work Rules!",autor:"Lazslo Bock",generos:["Negocios"],paginas:null},
  {id:113,titulo:"I will teach you to be rich",autor:"Ramt Sethi",generos:["Dinero y finanzas"],paginas:null},
  {id:114,titulo:"Closer to love",autor:"Vex King",generos:["Amor y familia"],paginas:null},
  {id:115,titulo:"De cero a uno",autor:"Peter Thiel",generos:["Negocios"],paginas:null},
  {id:116,titulo:"Women don't own you pretty",autor:"Florence Given",generos:["Política"],paginas:null},
  {id:117,titulo:"Think and grow rich",autor:"Napoleon Hill",generos:["Dinero y finanzas"],paginas:null},
  {id:118,titulo:"The 7 habits of high effective people",autor:"Stephen Covey",generos:["Productividad"],paginas:null},
  {id:119,titulo:"El primer minuto",autor:"Chris Fenning",generos:["Amor y familia"],paginas:null},
  {id:120,titulo:"Think big",autor:"Dr. Grace Lordan",generos:["Autoayuda"],paginas:null},
  {id:121,titulo:"El arte de pensar",autor:"Rolf Dobelli",generos:["Realizamiento"],paginas:null},
  {id:122,titulo:"The courage to be",autor:"Paul Tillich",generos:["Filosofía"],paginas:null},
  {id:123,titulo:"The untethered soul",autor:"Michael Singer",generos:["Filosofía"],paginas:null},
  {id:124,titulo:"Why has no one told me this before",autor:"Jordan Peterson",generos:["Autoayuda"],paginas:null},
  {id:125,titulo:"La montaña eres tú",autor:"Brianna Wiest",generos:["Autoayuda"],paginas:null},
  {id:126,titulo:"Radical Candor",autor:"Kim Scott",generos:["Negocios"],paginas:null},
  {id:127,titulo:"El aliento de los dioses",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:128,titulo:"Steal like an artist",autor:"Austin Kleon",generos:["Psicología"],paginas:null},
  {id:129,titulo:"Pensar deprisa, pensar despacio",autor:"Daniel Kahnemann",generos:["Psicología","Productividad"],paginas:null},
  {id:130,titulo:"El poder de los hábitos",autor:"Charles Duhigg",generos:["Productividad"],paginas:null},
  {id:131,titulo:"Rich dad, poor dad",autor:"Robert Kiyosaki",generos:["Dinero y finanzas"],paginas:null},
  {id:132,titulo:"Lost connections",autor:"Johann Harri",generos:["Salud"],paginas:null},
  {id:133,titulo:"22 inmutable laws of marketing",autor:"Ries and Trout",generos:["Negocios"],paginas:null},
  {id:134,titulo:"Decisive",autor:"Chip and Dan Heath",generos:["Work-life balance"],paginas:null},
  {id:135,titulo:"The psychology of money",autor:"Morgan Housel",generos:["Dinero y finanzas"],paginas:null},
  {id:136,titulo:"Mating in captivity",autor:"Esther Perel",generos:["Amor y familia"],paginas:null},
  {id:137,titulo:"Obtenga el sí",autor:"Roger Fisher",generos:["Negocios"],paginas:null},
  {id:138,titulo:"Invisible woman",autor:"Caroline Criado",generos:["Amor y familia","Política"],paginas:null},
  {id:139,titulo:"El héroe de las eras",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:140,titulo:"No hay partes malas",autor:"Richard Swortz",generos:["Psicología"],paginas:null},
  {id:141,titulo:"Conversaciones difíciles",autor:"Douglas Stone",generos:["Amor y familia"],paginas:null},
  {id:142,titulo:"Things you can see when you slow down",autor:"Haemin Sumin",generos:["Realizamiento"],paginas:null},
  {id:143,titulo:"The subtle art of not giving a fuck",autor:"Mark Manson",generos:["Realizamiento"],paginas:null},
  {id:144,titulo:"The art of procastination",autor:"John Perry",generos:["Productividad"],paginas:null},
  {id:145,titulo:"Think again",autor:"Adam Grant",generos:["Psicología"],paginas:null},
  {id:146,titulo:"El metal perdido",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:147,titulo:"Donde viven las musas",autor:"Marianela dos Santos",generos:["Poesía"],paginas:null},
  {id:148,titulo:"Far from the tree",autor:"Andrew Solomon",generos:["Amor y familia"],paginas:null},
  {id:149,titulo:"Bounce",autor:"Matthew Syed",generos:["Psicología"],paginas:null},
  {id:150,titulo:"Black Box Thinking",autor:"Matthew Syed",generos:["Negocios"],paginas:null},
  {id:151,titulo:"Come as you are",autor:"Emily Nagoski",generos:["Amor y familia","Salud"],paginas:null},
  {id:152,titulo:"The Antidote",autor:"Oliver Burkeman",generos:["Realizamiento"],paginas:null},
  {id:153,titulo:"Generación dopamina",autor:"Anna Lembke",generos:["Psicología"],paginas:null},
  {id:154,titulo:"Mindset",autor:"Carol Dweck",generos:["Psicología"],paginas:null},
  {id:155,titulo:"Made to stick",autor:"Chip y Dan Heath",generos:["Work-life balance","Negocios"],paginas:null},
  {id:156,titulo:"Eat that frog",autor:"Brian Tracey",generos:["Productividad"],paginas:null},
  {id:157,titulo:"Quiet",autor:"Susan Cain",generos:["Psicología"],paginas:null},
  {id:158,titulo:"La bolsa o la vida",autor:"Joe Dominguez",generos:["Dinero y finanzas"],paginas:null},
  {id:159,titulo:"The Silmarillion",autor:"J.R.R.Tolkien",generos:["Ficción","Fantasía"],paginas:null},
  {id:160,titulo:"Traction",autor:"Gino Wickman",generos:["Negocios"],paginas:null},
  {id:161,titulo:"Camino de reyes",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:162,titulo:"Lifespan",autor:"David Sinclair",generos:["Salud"],paginas:null},
  {id:163,titulo:"Proyecto Hail Mary",autor:"Andy Weir",generos:["Ficción","Ciencia"],paginas:null},
  {id:164,titulo:"Esquirla del amanecer",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:165,titulo:"Lo que nunca quise escribir",autor:"Marianela dos Santos",generos:["Poesía"],paginas:null},
  {id:166,titulo:"The war of art",autor:"Steven Pressfield",generos:["Psicología"],paginas:null},
  {id:167,titulo:"Educated",autor:"Tara Westover",generos:["Memorias"],paginas:null},
  {id:168,titulo:"El arte de la guerra",autor:"Sun Tzu",generos:["Filosofía"],paginas:null},
  {id:169,titulo:"La crisis de la narración",autor:"Byung-Chul Han",generos:["Psicología"],paginas:null},
  {id:170,titulo:"Finish what you start",autor:"Peter Hollins",generos:["Productividad"],paginas:null},
  {id:171,titulo:"Arcanum Ilimitado",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:172,titulo:"So good they can't ignore you",autor:"Cal Newport",generos:["Negocios"],paginas:null},
  {id:173,titulo:"Las leyes de la naturaleza humana",autor:"Robert Greene",generos:["Psicología"],paginas:null},
  {id:174,titulo:"12 more rules of life",autor:"Jordan Peterson",generos:["Autoayuda"],paginas:null},
  {id:175,titulo:"Solve for happy",autor:"Mo Gawdat",generos:["Realizamiento"],paginas:null},
  {id:176,titulo:"El pozo de la ascensión",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:177,titulo:"How to change your mind",autor:"Michael Pollan",generos:["Salud","Psicología"],paginas:null},
  {id:178,titulo:"La caída de Gondolin",autor:"J.R.R.Tolkien",generos:["Ficción","Fantasía"],paginas:null},
  {id:179,titulo:"El ritmo de la guerra",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:180,titulo:"Bigger Leaner Stronger",autor:"Michael Matthews",generos:["Salud"],paginas:null},
  {id:181,titulo:"The compound effect",autor:"Darren Hardy",generos:["Dinero y finanzas"],paginas:null},
  {id:182,titulo:"Start with why",autor:"Simon Sinek",generos:["Negocios"],paginas:null},
  {id:183,titulo:"Los hijos de Húrin",autor:"J.R.R.Tolkien",generos:["Ficción","Fantasía"],paginas:null},
  {id:184,titulo:"Mastery",autor:"Robert Greene",generos:["Psicología"],paginas:null},
  {id:185,titulo:"8 rules of love",autor:"Jay Shetty",generos:["Amor y familia","Romance"],paginas:null},
  {id:186,titulo:"La disciplina marcará tu destino",autor:"Ryan Holiday",generos:["Autoayuda"],paginas:null},
  {id:187,titulo:"We should all be feminists",autor:"Chimamanda Ngozi",generos:["Política"],paginas:null},
  {id:188,titulo:"Happy Sexy Millionaire",autor:"Steven Bartlett",generos:["Realizamiento"],paginas:null},
  {id:189,titulo:"The richest man in Babylon",autor:"George Clason",generos:["Dinero y finanzas"],paginas:null},
  {id:190,titulo:"The pathless path",autor:"Paul Millard",generos:["Work-life balance"],paginas:null},
  {id:191,titulo:"Unconditional parenting",autor:"Alfie Kohn",generos:["Amor y familia"],paginas:null},
  {id:192,titulo:"Inspired",autor:"Marty Cagan",generos:["Negocios"],paginas:null},
  {id:193,titulo:"El ego es el enemigo",autor:"Ryan Holiday",generos:["Autoayuda"],paginas:null},
  {id:194,titulo:"Tao te ching: el libro del camino",autor:"Lao Tzu",generos:["Realizamiento","Filosofía"],paginas:null},
  {id:195,titulo:"Rework",autor:"Jason Fried",generos:["Negocios"],paginas:null},
  {id:196,titulo:"El poder del ahora",autor:"Eckhart Talle",generos:["Realizamiento"],paginas:null},
  {id:197,titulo:"A guide to the good life",autor:"William Irvine",generos:["Filosofía"],paginas:null},
  {id:198,titulo:"The way of Zen",autor:"Alan Watts",generos:["Filosofía"],paginas:null},
  {id:199,titulo:"Good vibes, good life",autor:"Vex King",generos:["Amor y familia"],paginas:null},
  {id:200,titulo:"The 48 laws of power",autor:"Robert Greene",generos:["Psicología"],paginas:null},
  {id:201,titulo:"Palabras radiantes",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:202,titulo:"Hábitos Atómicos",autor:"James Clear",generos:["Autoayuda","Productividad"],paginas:null},
  {id:203,titulo:"Elantris",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:204,titulo:"Cuatro mil semanas",autor:"Oliver Burkeman",generos:["Work-life balance","Filosofía"],paginas:null},
  {id:205,titulo:"El estrecho sendero entre deseos",autor:"Pat Rothfuss",generos:["Ficción","Fantasía"],paginas:null},
  {id:206,titulo:"Juramentada",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:207,titulo:"Freakonomics",autor:"Steven Levitt",generos:["Dinero y finanzas","Psicología"],paginas:null},
  {id:208,titulo:"Hiperfoco",autor:"Chris Bailey",generos:["Productividad"],paginas:null},
  {id:209,titulo:"The daily stoic",autor:"Ryan Holiday",generos:["Filosofía"],paginas:null},
  {id:210,titulo:"12 rules of life",autor:"Jordan Peterson",generos:["Autoayuda","Filosofía"],paginas:null},
  {id:211,titulo:"Sombras de identidad",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:212,titulo:"Why we sleep",autor:"Matthew Walker",generos:["Salud"],paginas:null},
  {id:213,titulo:"El camino de los reyes",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:214,titulo:"La historia de Beren y Luthien",autor:"J.R.R.Tolkien",generos:["Ficción","Fantasía"],paginas:null},
  {id:215,titulo:"Five love languages",autor:"Gary Chapman",generos:["Amor y familia"],paginas:null},
  {id:216,titulo:"How to win friends",autor:"Dale Carnegie",generos:["Autoayuda"],paginas:null},
  {id:217,titulo:"The body keeps the score",autor:"Bessel van der Kolk",generos:["Salud","Psicología"],paginas:null},
  {id:218,titulo:"Getting things done",autor:"David Allen",generos:["Productividad"],paginas:null},
  {id:219,titulo:"Mind the gap",autor:"Esther Perel",generos:["Amor y familia"],paginas:null},
  {id:220,titulo:"Effortless",autor:"Greg Mckeown",generos:["Autoayuda","Productividad"],paginas:null},
  {id:221,titulo:"The simple path to wealth",autor:"J.L. Collins",generos:["Dinero y finanzas"],paginas:null},
  {id:222,titulo:"The school of life",autor:"Alain de Botton",generos:["Filosofía"],paginas:null},
  {id:223,titulo:"The power of vulnerability",autor:"Berné Brown",generos:["Psicología"],paginas:null},
  {id:224,titulo:"Brazales de duelo",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:225,titulo:"The one thing",autor:"Gary Keller",generos:["Productividad"],paginas:null},
  {id:226,titulo:"Rodeado de idiotas",autor:"Thomas Erikson",generos:["Amor y familia","Psicología"],paginas:null},
  {id:227,titulo:"Contra la empatía",autor:"Paul Bloom",generos:["Psicología"],paginas:null},
  {id:228,titulo:"Deep work",autor:"Cal Newport",generos:["Productividad"],paginas:null},
  {id:229,titulo:"Algorithms to live by",autor:"Brian Christian",generos:["Psicología","Ciencia"],paginas:null},
  {id:230,titulo:"El temor de un hombre sabio",autor:"Pat Rothfuss",generos:["Ficción","Fantasía"],paginas:null},
  {id:231,titulo:"How to not die alone",autor:"Logan Ury",generos:["Amor y familia","Romance"],paginas:null},
  {id:232,titulo:"Not a diet book",autor:"James Smith",generos:["Salud"],paginas:null},
  {id:233,titulo:"Ikigai",autor:"Héctor García",generos:["Realizamiento"],paginas:null},
  {id:234,titulo:"Never split the difference",autor:"Chris Voss",generos:["Negocios"],paginas:null},
  {id:235,titulo:"El nombre del viento",autor:"Pat Rothfuss",generos:["Ficción","Fantasía"],paginas:null},
  {id:236,titulo:"El imperio final",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:237,titulo:"How to stop worrying and start living",autor:"Dale Carnegie",generos:["Autoayuda"],paginas:null},
  {id:238,titulo:"Grit",autor:"Angela Duckworth",generos:["Psicología","Negocios"],paginas:null},
  {id:239,titulo:"The evolution of desire",autor:"David Buss",generos:["Amor y familia","Psicología"],paginas:null},
  {id:240,titulo:"Talking to strangers",autor:"Malcolm Gladwell",generos:["Psicología"],paginas:null},
  {id:241,titulo:"The Lean Startup",autor:"Eric Ries",generos:["Negocios"],paginas:null},
  {id:242,titulo:"Man's search for meaning",autor:"Viktor Frankl",generos:["Filosofía"],paginas:null},
  {id:243,titulo:"Breath",autor:"James Nestor",generos:["Salud"],paginas:null},
  {id:244,titulo:"Cuentos inconclusos de la tierra media",autor:"J.R.R.Tolkien",generos:["Ficción","Fantasía"],paginas:null},
  {id:245,titulo:"Die with zero",autor:"Bill Perkins",generos:["Dinero y finanzas"],paginas:null},
  {id:246,titulo:"Arena blanca ómnibus",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:247,titulo:"The four agreements",autor:"Miguel Ángel Ruiz",generos:["Amor y familia"],paginas:null},
  {id:248,titulo:"La canción de Aquiles",autor:"Madelline Miller",generos:["Ficción","Poesía"],paginas:null},
  {id:249,titulo:"Nonviolent communication",autor:"Marshall Rosenberg",generos:["Amor y familia"],paginas:null},
  {id:250,titulo:"Feel Good Productivity",autor:"Ali Abdaal",generos:["Productividad"],paginas:null},
  {id:251,titulo:"El bosón de Higgs no te va a hacer la cama",autor:"Javi Santaolalla",generos:["Ciencia","Física"],paginas:null},
  {id:252,titulo:"When breath becomes air",autor:"Kalanithi Paul",generos:["Memorias"],paginas:null},
  {id:253,titulo:"Aleación de ley",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:254,titulo:"Can't hurt me",autor:"David Goggins",generos:["Memorias"],paginas:null},
  {id:255,titulo:"Happy",autor:"Derren Brown",generos:["Filosofía"],paginas:null},
  {id:256,titulo:"The 5-am club",autor:"Robin Sharma",generos:["Productividad"],paginas:null},
  {id:257,titulo:"Jellyfish age backwards",autor:"Nicklas Brendborg",generos:["Salud","Biología"],paginas:null},
  {id:258,titulo:"Shoe dog",autor:"Phil Knight",generos:["Memorias","Productividad"],paginas:null},
  {id:259,titulo:"Inteligencia intuitiva",autor:"Malcolm Gladwell",generos:["Psicología"],paginas:null},
  {id:260,titulo:"The surrender experiment",autor:"Michael Singer",generos:["Psicología"],paginas:null},
  {id:261,titulo:"El cisne negro",autor:"Nassim Taleb",generos:["Psicología","Física"],paginas:null},
  {id:262,titulo:"Vida 3.0",autor:"Max Tegmark",generos:["Ciencia"],paginas:null},
  {id:263,titulo:"Jugarse la piel",autor:"Nassim Taleb",generos:["Psicología"],paginas:null},
  {id:264,titulo:"Antifrágil",autor:"Nassim Taleb",generos:["Psicología"],paginas:null},
  {id:265,titulo:"The happiness advantage",autor:"Shawn Anchor",generos:["Psicología"],paginas:null},
  {id:266,titulo:"The creative act",autor:"Rick Rubin",generos:["Psicología"],paginas:null},
  {id:267,titulo:"El hombre iluminado",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:268,titulo:"Viento y verdad",autor:"Brandon Sanderson",generos:["Ficción","Fantasía"],paginas:null},
  {id:269,titulo:"El señor de los anillos",autor:"J.R.R.Tolkien",generos:["Ficción","Fantasía"],paginas:null},
  {id:270,titulo:"How to take smart notes",autor:"Sonke Ahrens",generos:["Productividad"],paginas:null},
  {id:271,titulo:"La inteligencia emocional",autor:"Daniel Goleman",generos:["Psicología"],paginas:null},
  {id:272,titulo:"Kafka en la orilla",autor:"Haruki Murakami",generos:["Filosofía","Literatura"],paginas:null},
  {id:273,titulo:"The molecule of more",autor:"Daniel Lieberman",generos:["Psicología","Ciencia"],paginas:null},
  {id:274,titulo:"Sapiens",autor:"Yuval Harari",generos:["Historia","Biología"],paginas:null},
  {id:275,titulo:"The body",autor:"Bill Bryson",generos:["Biología","Salud"],paginas:null},
  {id:276,titulo:"Before the coffee gets cold",autor:"Kawaguchi",generos:["Literatura","Romance"],paginas:null},
  {id:277,titulo:"How we learn",autor:"Stanislas Dehaene",generos:["Productividad","Ciencia"],paginas:null},
  {id:278,titulo:"10x is easier than 2x",autor:"Dan Sullivan",generos:["Productividad","Negocios"],paginas:null},
  {id:279,titulo:"Self Compassion",autor:"Kristin Neff",generos:["Psicología"],paginas:null},
  {id:280,titulo:"The Hidden Life of trees",autor:"Peter Wohlleben",generos:["Biología"],paginas:null},
  {id:281,titulo:"The righteous mind",autor:"Jonathan Haidt",generos:["Política","Psicología"],paginas:null},
  {id:282,titulo:"The silk roads",autor:"Peter Frankopan",generos:["Historia"],paginas:null},
  {id:283,titulo:"Katabasis",autor:"R.F.Kuang",generos:["Ficción","Fantasía"],paginas:null},
  {id:284,titulo:"La vida invisible de Addie LaRue",autor:"V.E.Schwab",generos:["Lectura","Fantasía","Romance"],paginas:null},
  {id:285,titulo:"El imperio del vampiro",autor:"Jay Kristoff",generos:["Lectura","Fantasía"],paginas:null},
  {id:286,titulo:"Carl el Mazmorrero",autor:"Matt Dinniman",generos:["Lectura","Fantasía"],paginas:null},
  {id:287,titulo:"Aprendiz de asesino",autor:"Robin Hobb",generos:["Lectura","Fantasía"],paginas:null},
  {id:288,titulo:"La voluntad de muchos",autor:"James Islington",generos:["Lectura","Fantasía"],paginas:null},
  {id:289,titulo:"Glucose Revolution",autor:"Jessie Inchauspé",generos:["Salud"],paginas:null},
  {id:290,titulo:"La primera ley (trilogía)",autor:"Joe Abercrombie",generos:["Ficción","Fantasía"],paginas:null},
  {id:291,titulo:"La Era de la locura (trilogía)",autor:"Joe Abercrombie",generos:["Ficción","Fantasía"],paginas:null},
  {id:292,titulo:"La mejor venganza",autor:"Joe Abercrombie",generos:["Ficción","Fantasía"],paginas:null},
  {id:293,titulo:"Tierras rojas",autor:"Joe Abercrombie",generos:["Ficción","Fantasía"],paginas:null},
  {id:294,titulo:"Los diablos",autor:"Joe Abercrombie",generos:["Ficción","Fantasía"],paginas:null},
  {id:295,titulo:"Ciudad de hueso",autor:"Cassandra Clare",generos:["Ficción","Fantasía","Romance"],paginas:null},
  {id:296,titulo:"Ciudad de cenizas",autor:"Cassandra Clare",generos:["Ficción","Fantasía","Romance"],paginas:null},
  {id:297,titulo:"Ciudad de cristal",autor:"Cassandra Clare",generos:["Ficción","Fantasía","Romance"],paginas:null},
  {id:298,titulo:"Ángel mecánico",autor:"Cassandra Clare",generos:["Ficción","Fantasía","Romance"],paginas:null},
  {id:299,titulo:"Príncipe mecánico",autor:"Cassandra Clare",generos:["Ficción","Fantasía","Romance"],paginas:null},
  {id:300,titulo:"Princesa mecánica",autor:"Cassandra Clare",generos:["Ficción","Fantasía","Romance"],paginas:null},
  {id:301,titulo:"Ciudad de los ángeles caídos",autor:"Cassandra Clare",generos:["Ficción","Fantasía","Romance"],paginas:null},
  {id:302,titulo:"Lady Midnight",autor:"Cassandra Clare",generos:["Ficción","Fantasía","Romance"],paginas:null},
  {id:303,titulo:"El señor de las sombras",autor:"Cassandra Clare",generos:["Ficción","Fantasía","Romance"],paginas:null},
  {id:304,titulo:"La reina del aire y la oscuridad",autor:"Cassandra Clare",generos:["Ficción","Fantasía","Romance"],paginas:null},
  {id:305,titulo:"Hábitos atómicos en acción",autor:"James Clear",generos:["Autoayuda","Productividad"],paginas:null},
  {id:306,titulo:"How to build a car",autor:"Adrian Newey",generos:["Research","Memorias"],paginas:null},
  {id:307,titulo:"Race car aerodynamics",autor:"Joseph Katz",generos:["Research","Ingeniería"],paginas:null},
  {id:308,titulo:"Aerodynamics of road vehicles",autor:"Wolf Hucho",generos:["Research","Ingeniería"],paginas:null},
  {id:309,titulo:"Out of the wreckage",autor:"George Monbiot",generos:["Política"],paginas:null},
  {id:310,titulo:"Moral Ambition",autor:"Rutger Bregman",generos:["Política"],paginas:null},
  {id:311,titulo:"El señor de las moscas",autor:"William Golding",generos:["Literatura","Ficción"],paginas:null},
  {id:312,titulo:"Anna Karenina",autor:"Leo Tolstoy",generos:["Literatura","Romance"],paginas:null},
  {id:313,titulo:"1984",autor:"George Orwell",generos:["Literatura","Ficción"],paginas:null},
  {id:314,titulo:"Granja Animal",autor:"George Orwell",generos:["Literatura","Ficción"],paginas:null},
  {id:315,titulo:"Company of One",autor:"Paul Jarvis",generos:["Productividad","Negocios"],paginas:null},
  {id:316,titulo:"Supercommunicators",autor:"Charles Duhigg",generos:["Psicología"],paginas:null},
  {id:317,titulo:"Burnout",autor:"Emily Nagoski",generos:["Psicología","Salud"],paginas:null},
  {id:318,titulo:"ADHD 2.0",autor:"John Ratey",generos:["Psicología","Salud"],paginas:null},
  {id:319,titulo:"Ultra Processed People",autor:"Chris van Tulleken",generos:["Psicología","Salud"],paginas:null},
  {id:320,titulo:"How emotions are made",autor:"Lisa Barrett",generos:["Psicología"],paginas:null},
  {id:321,titulo:"Boys in Zinc",autor:"Svetlana Alexievich",generos:["Historia","Memorias"],paginas:null},
  {id:322,titulo:"La Iliada",autor:"Homero",generos:["Historia","Literatura","Poesía"],paginas:null},
  {id:323,titulo:"Meditaciones",autor:"Marco Aurelio",generos:["Filosofía"],paginas:null},
  {id:324,titulo:"La República",autor:"Platón",generos:["Filosofía"],paginas:null},
  {id:325,titulo:"Ética nicomáquea",autor:"Aristóteles",generos:["Filosofía"],paginas:null},
  {id:326,titulo:"El origen de las especies",autor:"Charles Darwin",generos:["Biología","Ciencia"],paginas:null},
  {id:327,titulo:"Six easy pieces",autor:"Richard Feynman",generos:["Física"],paginas:null},
  {id:328,titulo:"Lover girl",autor:"Raegan Fordemwalt",generos:["Poesía","Romance"],paginas:null},
  {id:329,titulo:"Los héroes",autor:"Joe Abercrombie",generos:["Ficción","Fantasía"],paginas:null},
  {id:330,titulo:"La trilogía del mar quebrado",autor:"Joe Abercrombie",generos:["Ficción","Fantasía"],paginas:null},
  {id:331,titulo:"Tiny Experiments",autor:"Anne-Laure",generos:["Productividad"],paginas:null},
  {id:332,titulo:"Confessions of a sociopath",autor:"M.E.Thomas",generos:["Psicología","Memorias"],paginas:null},
  {id:333,titulo:"Pure Invention",autor:"Matt Alt",generos:["Política","Historia"],paginas:null},
  {id:334,titulo:"Morning Star",autor:"Pierce Brown",generos:["Ficción","Fantasía"],paginas:null},
  {id:335,titulo:"La voluntad de muchos",autor:"James Islington",generos:["Ficción","Fantasía"],paginas:null},
];

function useSharedStorage(key, defaultValue) {
  const [data, setData] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);
  useEffect(()=>{
    (async()=>{
      try { const r=await window.storage.get(key,true); if(r&&r.value) setData(JSON.parse(r.value)); } catch(_){}
      setLoaded(true);
    })();
  },[key]);
  async function save(v) {
    setData(v);
    try { await window.storage.set(key,JSON.stringify(v),true); } catch(_){}
  }
  return [data,save,loaded];
}

function Stars({ value }) {
  return (
    <div style={{ display:"inline-flex",alignItems:"center",gap:6 }}>
      <div style={{ position:"relative",width:80,height:10 }}>
        <div style={{ position:"absolute",inset:0,background:"#1a4a48",borderRadius:3 }}/>
        <div style={{ position:"absolute",top:0,left:0,width:`${Math.min(value/10*100,100)}%`,height:"100%",background:`linear-gradient(90deg,${C.deepCyan},#3dd890)`,borderRadius:3 }}/>
      </div>
      <span style={{ color:C.medOrange,fontSize:13,fontWeight:700 }}>{value}</span>
    </div>
  );
}

function GenreMultiSelect({ value=[], onChange }) {
  return (
    <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginTop:4 }}>
      {GENEROS_LIST.map(g=>{
        const on=value.includes(g);
        return <button key={g} type="button" onClick={()=>onChange(on?value.filter(x=>x!==g):[...value,g])}
          style={{ padding:"3px 10px",borderRadius:12,border:`1px solid ${on?C.deepCyan:"#1a5a58"}`,background:on?`${C.deepCyan}33`:"transparent",color:on?C.deepCyan:"#8cc",fontSize:11,cursor:"pointer" }}>
          {on?"✓ ":""}{g}
        </button>;
      })}
    </div>
  );
}

const GENRE_COLORS = { "Ficción":C.deepCyan,"Fantasía":"#60c090","Romance":"#ff9ab0","Psicología":"#7ab4d4","Filosofía":"#c4b464","Negocios":"#9ad464","Historia":"#d4a464","Salud":"#64d4b4","Poesía":"#d48ad4","Ciencia":"#64b4d4","Física":"#d46464","Research":"#a0a0a0" };
function GenreTags({ generos }) {
  if(!generos||!generos.length) return null;
  return <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>{generos.map(g=>(
    <span key={g} style={{ fontSize:10,padding:"2px 7px",borderRadius:10,border:`1px solid ${GENRE_COLORS[g]||"#1a5a58"}55`,color:GENRE_COLORS[g]||"#8cc",background:`${GENRE_COLORS[g]||"#1a5a58"}18` }}>{g}</span>
  ))}</div>;
}

const iS={background:"rgba(0,0,0,0.3)",border:`1px solid #1a5a58`,borderRadius:6,padding:"8px 10px",color:C.paleOrange,fontSize:12,fontFamily:"Georgia,serif",width:"100%",boxSizing:"border-box"};
const sS={...iS,cursor:"pointer"};

function Btn({label,onClick,secondary,sm}) {
  return <button onClick={onClick} style={{ background:secondary?"rgba(255,255,255,0.07)":C.deepCyan,color:secondary?C.paleOrange:C.darkCyan,border:secondary?`1px solid #1a5a58`:"none",padding:sm?"5px 12px":"8px 18px",borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:sm?11:12,fontFamily:"Georgia,serif" }}>{label}</button>;
}
function IBtn({icon,onClick,danger,sm}) {
  return <button onClick={onClick} style={{ background:danger?"rgba(200,60,60,0.15)":"rgba(5,175,106,0.15)",border:"none",color:danger?"#f99":C.deepCyan,cursor:"pointer",padding:sm?"2px 5px":"4px 8px",borderRadius:4,fontSize:sm?10:12 }}>{icon}</button>;
}
function SH({title,sub,action}) {
  return <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18 }}>
    <div><h2 style={{ margin:0,fontSize:19,color:C.medOrange }}>{title}</h2>{sub&&<div style={{ fontSize:11,color:"#8cc",marginTop:2 }}>{sub}</div>}</div>
    {action&&<Btn label={action.label} onClick={action.fn}/>}
  </div>;
}
function Empty({msg}) { return <div style={{ textAlign:"center",padding:28,color:"#556",fontSize:13 }}>{msg}</div>; }
function Card({title,children}) {
  return <div style={{ background:C.medCyan,borderRadius:10,padding:16,marginBottom:14 }}>
    <h3 style={{ margin:"0 0 14px",fontSize:13,color:C.medOrange }}>{title}</h3>{children}
  </div>;
}
function FL({label,children,wide}) {
  return <div style={{ gridColumn:wide?"1 / -1":undefined,marginBottom:8 }}>
    <label style={{ display:"block",fontSize:10,color:"#8cc",marginBottom:4 }}>{label}</label>{children}
  </div>;
}
function Modal({title,children,onClose,wide}) {
  return <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
    <div style={{ background:C.medCyan,borderRadius:14,padding:22,width:"100%",maxWidth:wide?560:420,maxHeight:"92vh",overflowY:"auto",border:`1px solid #1a5a58` }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
        <h2 style={{ margin:0,fontSize:16,color:C.medOrange }}>{title}</h2>
        <button onClick={onClose} style={{ background:"none",border:"none",color:C.paleOrange,cursor:"pointer",fontSize:18 }}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}

function PrioTag({value,quien}) { return null; } // kept for compat, unused

// ---- PAGES ----
function BibliotecaPage({biblioteca,saveBiblioteca,leidos}) {
  const [search,setSearch]=useState("");const [fg,setFg]=useState("");
  const [filterRec,setFilterRec]=useState("");
  const [showForm,setShowForm]=useState(false);const [editItem,setEditItem]=useState(null);
  const leidosSet=useMemo(()=>new Set(leidos.map(l=>l.titulo?.toLowerCase().trim())),[leidos]);
  const filtered=useMemo(()=>biblioteca.filter(b=>{
    const ms=!search||b.titulo?.toLowerCase().includes(search.toLowerCase())||b.autor?.toLowerCase().includes(search.toLowerCase());
    const mg=!fg||(b.generos&&b.generos.includes(fg));
    const mr=!filterRec||(b.recomendadoPor&&b.recomendadoPor.includes(filterRec));
    return ms&&mg&&mr;
  }),[biblioteca,search,fg,filterRec]);
  function handleSave(book) {
    if(book.id) saveBiblioteca(biblioteca.map(b=>b.id===book.id?book:b));
    else saveBiblioteca([...biblioteca,{...book,id:Date.now()}]);
    setShowForm(false);setEditItem(null);
  }
  function handleDelete(id){if(window.confirm("¿Eliminar?"))saveBiblioteca(biblioteca.filter(b=>b.id!==id));}
  const anyFilter=search||fg||filterRec;
  return <div>
    <SH title="Biblioteca Conjunta" sub={`${biblioteca.length} libros · ${leidos.length} leídos`} action={{label:"+ Añadir",fn:()=>setShowForm(true)}}/>
    <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap" }}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar título o autor..." style={{...iS,width:190}}/>
      <select value={fg} onChange={e=>setFg(e.target.value)} style={sS}>
        <option value="">Todos los géneros</option>{GENEROS_LIST.map(g=><option key={g}>{g}</option>)}
      </select>
      <select value={filterRec} onChange={e=>setFilterRec(e.target.value)} style={sS}>
        <option value="">💌 Todas recomendaciones</option>
        <option value="K">💌 Rec. por Kiara</option>
        <option value="P">💌 Rec. por Pablo</option>
      </select>
      {anyFilter&&<Btn label="✕ Limpiar" onClick={()=>{setSearch("");setFg("");setFilterRec("");}} secondary sm/>}
    </div>
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
        <thead><tr style={{ background:C.medCyan }}>{["#","Título","Autor","Géneros","Estado",""].map(h=><th key={h} style={{ padding:"9px 10px",textAlign:"left",color:C.medOrange,fontWeight:700,borderBottom:`1px solid #1a5a58` }}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map((b,i)=>{
          const yl=leidosSet.has(b.titulo?.toLowerCase().trim());
          const recs=b.recomendadoPor||[];
          return <tr key={b.id} style={{ background:i%2===0?"rgba(255,255,255,0.025)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
            <td style={{ padding:"8px 10px",color:"#556",fontSize:11 }}>{i+1}</td>
            <td style={{ padding:"8px 10px",color:yl?C.deepCyan:C.paleOrange,fontWeight:yl?600:400 }}>
              {yl&&<span style={{ marginRight:5,fontSize:10 }}>✓</span>}{b.titulo}
              {recs.length>0&&<div style={{ display:"flex",gap:4,marginTop:3,flexWrap:"wrap" }}>
                {recs.includes("K")&&<span style={{ fontSize:9,padding:"1px 6px",borderRadius:8,background:`${C.K}22`,color:C.K,border:`1px solid ${C.K}44` }}>💌 Kiara</span>}
                {recs.includes("P")&&<span style={{ fontSize:9,padding:"1px 6px",borderRadius:8,background:`${C.P}22`,color:C.P,border:`1px solid ${C.P}44` }}>💌 Pablo</span>}
              </div>}
            </td>
            <td style={{ padding:"8px 10px",color:"#aad4d0",fontSize:11 }}>{b.autor}</td>
            <td style={{ padding:"8px 10px" }}><GenreTags generos={b.generos}/></td>
            <td style={{ padding:"8px 10px" }}>{yl?<span style={{ color:C.deepCyan,fontSize:10,fontWeight:700 }}>LEÍDO</span>:<span style={{ color:"#445",fontSize:10 }}>pendiente</span>}</td>
            <td style={{ padding:"8px 10px" }}><div style={{ display:"flex",gap:4 }}><IBtn icon="✏" onClick={()=>setEditItem(b)}/><IBtn icon="✕" onClick={()=>handleDelete(b.id)} danger/></div></td>
          </tr>;
        })}</tbody>
      </table>
      {!filtered.length&&<Empty msg="Sin resultados"/>}
    </div>
    {(showForm||editItem)&&<BibFormModal book={editItem} onSave={handleSave} onClose={()=>{setShowForm(false);setEditItem(null);}}/>}
  </div>;
}

function LeidosPage({leidos,saveLeidos,biblioteca}) {
  const [lector,setLector]=useState("Todos");const [fg,setFg]=useState("");const [mes,setMes]=useState("");const [search,setSearch]=useState("");
  const [showForm,setShowForm]=useState(false);const [editItem,setEditItem]=useState(null);
  const filtered=useMemo(()=>leidos.filter(b=>{
    const ml=lector==="Todos"||b.lector===lector;
    const mg=!fg||(b.generos&&b.generos.includes(fg));
    const mm=!mes||b.mesLeido===mes;
    const ms=!search||b.titulo?.toLowerCase().includes(search.toLowerCase())||b.autor?.toLowerCase().includes(search.toLowerCase());
    return ml&&mg&&mm&&ms;
  }),[leidos,lector,fg,mes,search]);
  function handleSave(book) {
    const dup=leidos.some(b=>b.id!==book.id&&b.titulo?.toLowerCase().trim()===book.titulo?.toLowerCase().trim()&&b.lector===book.lector);
    if(dup){alert("⚠️ Este libro ya está registrado para este lector.");return;}
    if(book.id) saveLeidos(leidos.map(b=>b.id===book.id?book:b));
    else saveLeidos([...leidos,{...book,id:Date.now()}]);
    setShowForm(false);setEditItem(null);
  }
  function handleDelete(id){if(window.confirm("¿Eliminar?"))saveLeidos(leidos.filter(b=>b.id!==id));}
  const kC=leidos.filter(b=>b.lector==="K").length,pC=leidos.filter(b=>b.lector==="P").length;
  return <div>
    <SH title="Libros Leídos" sub={`${leidos.length} total · 👩 K:${kC} · 👨 P:${pC}`} action={{label:"+ Añadir leído",fn:()=>setShowForm(true)}}/>
    <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" }}>
      {["Todos","K","P"].map(l=><button key={l} onClick={()=>setLector(l)} style={{ padding:"6px 14px",borderRadius:20,border:`1px solid ${lector===l?(l==="K"?C.K:l==="P"?C.P:C.deepCyan):"#1a5a58"}`,background:lector===l?(l==="K"?`${C.K}22`:l==="P"?`${C.P}22`:`${C.deepCyan}22`):"transparent",color:lector===l?(l==="K"?C.K:l==="P"?C.P:C.deepCyan):"#8cc",fontSize:12,cursor:"pointer" }}>{l==="Todos"?"👥 Todos":l==="K"?"👩 Kiara":"👨 Pablo"}</button>)}
      <select value={fg} onChange={e=>setFg(e.target.value)} style={sS}><option value="">Todos géneros</option>{GENEROS_LIST.map(g=><option key={g}>{g}</option>)}</select>
      <select value={mes} onChange={e=>setMes(e.target.value)} style={sS}><option value="">Todos los meses</option>{MESES.map(m=><option key={m}>{m}</option>)}</select>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{...iS,width:130}}/>
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12 }}>
      {filtered.map(b=><LeidoCard key={b.id} book={b} onEdit={()=>setEditItem(b)} onDelete={()=>handleDelete(b.id)}/>)}
    </div>
    {!filtered.length&&<Empty msg="Nada aquí todavía"/>}
    {(showForm||editItem)&&<LeidoFormModal book={editItem} biblioteca={biblioteca} onSave={handleSave} onClose={()=>{setShowForm(false);setEditItem(null);}}/>}
  </div>;
}

function LeidoCard({book,onEdit,onDelete}) {
  const bc=book.lector==="K"?C.K:C.P;
  return <div style={{ background:C.medCyan,borderRadius:10,padding:14,borderLeft:`3px solid ${bc}` }}>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontSize:14,fontWeight:700,color:C.medOrange,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{book.titulo}</div>
        <div style={{ fontSize:11,color:"#aad4d0" }}>{book.autor}</div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,marginLeft:8,flexShrink:0 }}>
        <div style={{ width:28,height:28,borderRadius:"50%",background:bc,color:C.darkCyan,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12 }}>{book.lector}</div>
        <div style={{ display:"flex",gap:3 }}><IBtn icon="✏" onClick={onEdit} sm/><IBtn icon="✕" onClick={onDelete} danger sm/></div>
      </div>
    </div>
    <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:8 }}>
      <GenreTags generos={book.generos}/>
      <span style={{ fontSize:10,background:"rgba(255,255,255,0.08)",padding:"2px 7px",borderRadius:10 }}>{book.formato}</span>
      {book.mesLeido&&<span style={{ fontSize:10,background:`${C.deepCyan}22`,padding:"2px 7px",borderRadius:10,color:C.deepCyan }}>{book.mesLeido}</span>}
    </div>
    {book.total>0&&<div>
      <Stars value={book.total}/>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,marginTop:6 }}>
        {[["Personaje",book.personaje],["Prosa",book.prosa],["Trama",book.trama],["Aprendizaje",book.aprendizaje],["Entretenimiento",book.entretenimiento]].map(([k,v])=>v>0&&<div key={k} style={{ fontSize:10,color:"#8cc" }}>{k}: <span style={{ color:C.paleOrange }}>{v}</span></div>)}
      </div>
    </div>}
  </div>;
}

function EstadisticasPage({leidos}) {
  const kB=leidos.filter(b=>b.lector==="K"),pB=leidos.filter(b=>b.lector==="P");
  const byMonth=useMemo(()=>{
    const m={};MESES.forEach(x=>{m[x]={K:0,P:0}});
    leidos.forEach(b=>{if(b.mesLeido&&m[b.mesLeido])m[b.mesLeido][b.lector]=(m[b.mesLeido][b.lector]||0)+1});
    return MESES.map(x=>({mes:x.slice(0,3),...m[x]})).filter(x=>x.K||x.P);
  },[leidos]);
  const ranking=useMemo(()=>leidos.filter(b=>b.total>0).sort((a,b)=>b.total-a.total).slice(0,10),[leidos]);
  const avg=leidos.filter(b=>b.total>0);
  const avgV=avg.length?(avg.reduce((s,b)=>s+b.total,0)/avg.length).toFixed(1):"-";
  function topA(books){const m={};books.forEach(b=>{if(b.autor)m[b.autor]=(m[b.autor]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,count])=>({name,count}));}
  return <div>
    <SH title="Estadísticas" sub="Tu año en libros"/>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20 }}>
      {[["📚","Total",leidos.length,null],["👩","Kiara",kB.length,C.K],["👨","Pablo",pB.length,C.P],["⭐","Nota media",avgV,C.deepCyan]].map(([icon,label,value,color])=>(
        <div key={label} style={{ background:C.medCyan,borderRadius:10,padding:"14px 10px",textAlign:"center",borderBottom:`2px solid ${color||"#1a4a48"}` }}>
          <div style={{ fontSize:18 }}>{icon}</div>
          <div style={{ fontSize:22,fontWeight:900,color:color||C.medOrange,margin:"4px 0 2px" }}>{value}</div>
          <div style={{ fontSize:10,color:"#8cc" }}>{label}</div>
        </div>
      ))}
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
      <Card title="📖 Autores — Kiara">{topA(kB).length?topA(kB).map(d=><BarRow key={d.name} d={d} max={Math.max(...topA(kB).map(x=>x.count),1)} color={C.K}/>):<Empty msg="Sin datos"/>}</Card>
      <Card title="📖 Autores — Pablo">{topA(pB).length?topA(pB).map(d=><BarRow key={d.name} d={d} max={Math.max(...topA(pB).map(x=>x.count),1)} color={C.P}/>):<Empty msg="Sin datos"/>}</Card>
    </div>
    {byMonth.length>0&&<Card title="📅 Libros por mes">
      <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:148,overflowX:"auto" }}>
        {byMonth.map(d=>{
          const max=Math.max(...byMonth.flatMap(x=>[x.K,x.P]),1);
          return <div key={d.mes} style={{ display:"flex",flexDirection:"column",alignItems:"center",minWidth:38 }}>
            <div style={{ display:"flex",alignItems:"flex-end",gap:3,height:120 }}>
              <div style={{ width:13,height:`${(d.K/max)*120}px`,background:C.K,borderRadius:"3px 3px 0 0",position:"relative" }}>{d.K>0&&<span style={{ position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",fontSize:9,color:C.K }}>{d.K}</span>}</div>
              <div style={{ width:13,height:`${(d.P/max)*120}px`,background:C.P,borderRadius:"3px 3px 0 0",position:"relative" }}>{d.P>0&&<span style={{ position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",fontSize:9,color:C.P }}>{d.P}</span>}</div>
            </div>
            <div style={{ fontSize:9,color:"#8cc",marginTop:4 }}>{d.mes}</div>
          </div>;
        })}
      </div>
      <div style={{ display:"flex",gap:14,justifyContent:"flex-end",marginTop:8 }}><span style={{ fontSize:11,color:C.K }}>■ Kiara</span><span style={{ fontSize:11,color:C.P }}>■ Pablo</span></div>
    </Card>}
    <Card title="🏆 Ranking por nota">
      {ranking.map((b,i)=><div key={b.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width:26,height:26,borderRadius:"50%",background:i<3?C.deepCyan:"#1a4a48",color:i<3?C.darkCyan:C.paleOrange,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,flexShrink:0 }}>{i+1}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:12,color:C.medOrange,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{b.titulo}</div>
          <div style={{ fontSize:10,color:"#8cc" }}>{b.autor} · <span style={{ color:b.lector==="K"?C.K:C.P }}>{b.lector==="K"?"Kiara":"Pablo"}</span></div>
        </div>
        <Stars value={b.total}/>
      </div>)}
      {!ranking.length&&<Empty msg="Sin libros puntuados aún"/>}
    </Card>
  </div>;
}
function BarRow({d,max,color}) {
  return <div style={{ marginBottom:8 }}>
    <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2 }}>
      <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"80%",color:C.paleOrange }}>{d.name}</span>
      <span style={{ color }}>{d.count}</span>
    </div>
    <div style={{ background:"#1a3a38",borderRadius:3,height:7 }}><div style={{ width:`${(d.count/max)*100}%`,height:"100%",background:color,borderRadius:3 }}/></div>
  </div>;
}

function AleatorioPage({biblioteca,leidos,listaK,listaP}) {
  const [rec,setRec]=useState(null);const [spinning,setSpinning]=useState(false);
  const [fg,setFg]=useState("");const [filterRec,setFilterRec]=useState("");
  const [peso,setPeso]=useState(50);

  const leidosSet=useMemo(()=>new Set(leidos.map(l=>l.titulo?.toLowerCase().trim())),[leidos]);

  // Build pool: unread books from biblioteca
  const pool=useMemo(()=>biblioteca.filter(b=>{
    const nl=!leidosSet.has(b.titulo?.toLowerCase().trim());
    const mg=!fg||(b.generos&&b.generos.includes(fg));
    const mr=!filterRec||(b.recomendadoPor&&b.recomendadoPor.includes(filterRec));
    return nl&&mg&&mr;
  }),[biblioteca,leidosSet,fg,filterRec]);

  // Weighted pick using combined K+P list positions
  // Position 0 (top of list) = highest weight. Not in either list = neutral weight.
  function weightedPick(books) {
    if(!books.length) return null;
    if(peso===0) return books[Math.floor(Math.random()*books.length)];
    const totalK=listaK.length, totalP=listaP.length;
    const weighted=books.map(b=>{
      const posK=listaK.indexOf(b.id); // -1 if not in list
      const posP=listaP.indexOf(b.id);
      // Convert position to a score: top = high, bottom = low, not listed = mid
      const scoreK=posK===-1 ? 0.5 : 1-(posK/Math.max(totalK,1));
      const scoreP=posP===-1 ? 0.5 : 1-(posP/Math.max(totalP,1));
      const baseScore=Math.max(scoreK,scoreP); // use best (highest interest from either)
      // Blend: peso=0 → w=1 (flat), peso=100 → w fully driven by position
      const w=1+(baseScore*3-1)*(peso/100);
      return {book:b, w:Math.max(w,0.05)};
    });
    const total=weighted.reduce((s,x)=>s+x.w,0);
    let r=Math.random()*total;
    for(const {book,w} of weighted){r-=w;if(r<=0)return book;}
    return weighted[weighted.length-1].book;
  }

  function spin(){
    if(!pool.length) return;
    setSpinning(true);setRec(null);
    setTimeout(()=>{setRec(weightedPick(pool));setSpinning(false);},700);
  }

  const getRecs=(b)=>b?.recomendadoPor||[];
  const getPosLabel=(b)=>{
    const pk=listaK.indexOf(b.id); const pp=listaP.indexOf(b.id);
    const parts=[];
    if(pk!==-1) parts.push(`#${pk+1} lista Kiara`);
    if(pp!==-1) parts.push(`#${pp+1} lista Pablo`);
    return parts.join(" · ");
  };

  return <div>
    <SH title="Libro Aleatorio" sub="Déjate sorprender"/>
    <div style={{ display:"flex",gap:8,marginBottom:12,flexWrap:"wrap" }}>
      <select value={fg} onChange={e=>setFg(e.target.value)} style={sS}>
        <option value="">Cualquier género</option>{GENEROS_LIST.map(g=><option key={g}>{g}</option>)}
      </select>
      <select value={filterRec} onChange={e=>setFilterRec(e.target.value)} style={sS}>
        <option value="">💌 Todas recomendaciones</option>
        <option value="K">💌 Rec. por Kiara</option>
        <option value="P">💌 Rec. por Pablo</option>
      </select>
      {(fg||filterRec)&&<Btn label="✕" onClick={()=>{setFg("");setFilterRec("");}} secondary sm/>}
    </div>

    {/* PESO SLIDER */}
    <div style={{ background:C.medCyan,borderRadius:10,padding:"14px 16px",marginBottom:20,border:"1px solid #1a5a58" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
        <span style={{ fontSize:12,color:C.medOrange,fontWeight:700 }}>⚖️ Peso de la lista de prioridad</span>
        <span style={{ fontSize:13,color:C.deepCyan,fontWeight:900 }}>{peso}%</span>
      </div>
      <input type="range" min={0} max={100} step={10} value={peso}
        onChange={e=>setPeso(Number(e.target.value))}
        style={{ width:"100%",accentColor:C.deepCyan }}/>
      <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:"#556",marginTop:4 }}>
        <span>🎲 100% aleatorio</span>
        <span>📋 Lista manda</span>
      </div>
      <div style={{ fontSize:10,color:"#778",marginTop:6,lineHeight:1.4 }}>
        {peso===0 ? "Todos los libros tienen exactamente la misma probabilidad." :
         peso<40  ? "La lista influye un poco, pero hay mucha aleatoriedad." :
         peso<70  ? "Equilibrio: los primeros de la lista tienen más peso, pero todo puede salir." :
                    "Los primeros de la lista tienen mucho más probabilidad. Los últimos casi no salen."}
        {(listaK.length===0&&listaP.length===0)&&" · ⚠️ Las listas están vacías, ve a 📋 Lista para ordenar."}
      </div>
    </div>

    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
      <span style={{ fontSize:11,color:"#8cc" }}>{pool.length} libros en el pool</span>
    </div>

    <div style={{ textAlign:"center",marginBottom:28 }}>
      <button onClick={spin} disabled={!pool.length||spinning}
        style={{ background:pool.length?C.deepCyan:"#1a4a48",color:C.darkCyan,border:"none",padding:"16px 52px",borderRadius:30,fontSize:15,fontWeight:900,cursor:pool.length?"pointer":"not-allowed",fontFamily:"Georgia,serif",letterSpacing:2,opacity:pool.length?1:0.5 }}>
        {spinning?"🎲 ...":"🎲  ¡Recomiéndame uno!"}
      </button>
    </div>

    {rec&&!spinning&&(()=>{
      const recs=getRecs(rec);
      const posLabel=getPosLabel(rec);
      return <div style={{ background:C.medCyan,borderRadius:14,padding:28,maxWidth:440,margin:"0 auto",textAlign:"center",border:`2px solid ${C.deepCyan}` }}>
        <div style={{ fontSize:40,marginBottom:10 }}>📖</div>
        <div style={{ fontSize:22,fontWeight:900,color:C.medOrange,marginBottom:6,lineHeight:1.2 }}>{rec.titulo}</div>
        <div style={{ fontSize:13,color:"#aad4d0",marginBottom:14 }}>{rec.autor}</div>
        <div style={{ display:"flex",justifyContent:"center",flexWrap:"wrap",gap:6,marginBottom:10 }}>
          <GenreTags generos={rec.generos}/>
        </div>
        {posLabel&&<div style={{ fontSize:11,color:C.deepCyan,marginBottom:8,fontWeight:600 }}>📋 {posLabel}</div>}
        {recs.includes("K")&&<div style={{ fontSize:11,color:C.K,marginBottom:4 }}>💌 Kiara lo recomienda</div>}
        {recs.includes("P")&&<div style={{ fontSize:11,color:C.P,marginBottom:4 }}>💌 Pablo lo recomienda</div>}
        {rec.paginas&&<div style={{ fontSize:11,color:"#8cc",marginTop:8 }}>{rec.paginas} páginas</div>}
      </div>;
    })()}
    {!pool.length&&<div style={{ textAlign:"center",color:"#8cc",padding:24 }}>🎉 ¡No quedan libros sin leer con esos filtros!</div>}
  </div>;
}

function ComprarPage({leidos}) {
  const list=useMemo(()=>leidos.filter(b=>b.formato==="Ebook"&&b.total>=7).sort((a,b)=>b.total-a.total),[leidos]);
  return <div>
    <SH title="Lista de Compra" sub="Ebooks leídos con nota ≥ 7 → candidatos a comprar en papel"/>
    {!list.length?<Empty msg="Ningún ebook supera el 7 aún"/>:
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:12 }}>
      {list.map(b=><div key={b.id} style={{ background:C.medCyan,borderRadius:10,padding:14,border:`1px solid ${C.medOrange}22` }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:13,fontWeight:700,color:C.medOrange,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{b.titulo}</div>
            <div style={{ fontSize:11,color:"#aad4d0",marginBottom:8 }}>{b.autor}</div>
            <GenreTags generos={b.generos}/>
          </div>
          <div style={{ textAlign:"center",marginLeft:10,flexShrink:0 }}>
            <div style={{ fontSize:24,fontWeight:900,color:C.deepCyan }}>{b.total}</div>
            <div style={{ fontSize:9,color:"#8cc" }}>/10</div>
          </div>
        </div>
        <div style={{ marginTop:10 }}><Stars value={b.total}/></div>
        <div style={{ fontSize:10,color:b.lector==="K"?C.K:C.P,marginTop:6 }}>{b.lector==="K"?"👩 Kiara":"👨 Pablo"}</div>
      </div>)}
    </div>}
  </div>;
}

function BibFormModal({book,onSave,onClose}) {
  const [form,setForm]=useState(book ? {...book,recomendadoPor:book.recomendadoPor||[]} : {titulo:"",autor:"",generos:[],paginas:"",recomendadoPor:[]});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const toggleRec=(who)=>{
    const cur=form.recomendadoPor||[];
    set("recomendadoPor",cur.includes(who)?cur.filter(x=>x!==who):[...cur,who]);
  };
  return <Modal title={book?"Editar libro":"Añadir a biblioteca"} onClose={onClose} wide>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
      <FL label="Título *" wide><input value={form.titulo} onChange={e=>set("titulo",e.target.value)} style={iS} autoFocus/></FL>
      <FL label="Autor"><input value={form.autor||""} onChange={e=>set("autor",e.target.value)} style={iS}/></FL>
      <FL label="Páginas"><input type="number" value={form.paginas||""} onChange={e=>set("paginas",e.target.value)} style={iS}/></FL>
    </div>
    <FL label="Géneros (puede ser varios)"><GenreMultiSelect value={form.generos||[]} onChange={v=>set("generos",v)}/></FL>
    <div style={{ background:"rgba(0,0,0,0.2)",borderRadius:8,padding:12,marginTop:14 }}>
      <div style={{ fontSize:11,color:C.medOrange,fontWeight:700,marginBottom:10 }}>💌 Recomendado por</div>
      <div style={{ display:"flex",gap:8 }}>
        {[["K","👩 Kiara",C.K],["P","👨 Pablo",C.P]].map(([who,lbl,col])=>{
          const on=(form.recomendadoPor||[]).includes(who);
          return <button key={who} type="button" onClick={()=>toggleRec(who)}
            style={{ padding:"6px 18px",borderRadius:12,border:`1px solid ${on?col:"#1a5a58"}`,background:on?`${col}22`:"transparent",color:on?col:"#8cc",fontSize:13,cursor:"pointer" }}>
            {on?"✓ ":""}{lbl}
          </button>;
        })}
      </div>
      <div style={{ fontSize:10,color:"#556",marginTop:6 }}>Marca quién recomienda este libro al otro</div>
    </div>
    <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:16 }}>
      <Btn label="Cancelar" onClick={onClose} secondary/><Btn label="Guardar" onClick={()=>{if(!form.titulo)return alert("Título obligatorio");onSave(form);}}/>
    </div>
  </Modal>;
}

function LeidoFormModal({book,biblioteca,onSave,onClose}) {
  const [form,setForm]=useState(book||{titulo:"",autor:"",generos:[],formato:"Ebook",lector:"K",mesLeido:"Enero",paginas:"",personaje:0,prosa:0,trama:0,aprendizaje:0,entretenimiento:0,total:0});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const calcT=()=>{const v=[form.personaje,form.prosa,form.trama,form.aprendizaje,form.entretenimiento].map(Number).filter(x=>x>0);return v.length?parseFloat((v.reduce((a,b)=>a+b,0)/v.length).toFixed(1)):0;};
  function autofill(val){set("titulo",val);const f=biblioteca.find(b=>b.titulo?.toLowerCase()===val.toLowerCase());if(f)setForm(p=>({...p,titulo:f.titulo,autor:f.autor||p.autor,generos:f.generos||p.generos,paginas:f.paginas||p.paginas}));}
  return <Modal title={book?"Editar lectura":"Registrar lectura"} onClose={onClose} wide>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
      <FL label="Título *" wide>
        <input list="btitles" value={form.titulo} onChange={e=>autofill(e.target.value)} style={iS} placeholder="Escribe o elige de la biblioteca"/>
        <datalist id="btitles">{biblioteca.map(b=><option key={b.id} value={b.titulo}/>)}</datalist>
      </FL>
      <FL label="Autor"><input value={form.autor||""} onChange={e=>set("autor",e.target.value)} style={iS}/></FL>
      <FL label="Lector"><select value={form.lector} onChange={e=>set("lector",e.target.value)} style={sS}><option value="K">👩 Kiara</option><option value="P">👨 Pablo</option></select></FL>
      <FL label="Formato"><select value={form.formato} onChange={e=>set("formato",e.target.value)} style={sS}>{FORMATOS.map(f=><option key={f}>{f}</option>)}</select></FL>
      <FL label="Mes leído"><select value={form.mesLeido} onChange={e=>set("mesLeido",e.target.value)} style={sS}>{MESES.map(m=><option key={m}>{m}</option>)}</select></FL>
      <FL label="Páginas"><input type="number" value={form.paginas||""} onChange={e=>set("paginas",e.target.value)} style={iS}/></FL>
    </div>
    <FL label="Géneros (puede ser varios)"><GenreMultiSelect value={form.generos||[]} onChange={v=>set("generos",v)}/></FL>
    <div style={{ background:"rgba(0,0,0,0.25)",borderRadius:8,padding:12,marginTop:12 }}>
      <div style={{ fontSize:12,color:C.medOrange,marginBottom:10,fontWeight:700 }}>Puntuación (0–10)</div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
        {[["personaje","Personaje"],["prosa","Prosa"],["trama","Trama"],["aprendizaje","Aprendizaje"],["entretenimiento","Entretenimiento"]].map(([k,label])=>(
          <div key={k}><div style={{ fontSize:11,color:"#8cc",marginBottom:3 }}>{label}: <span style={{ color:C.medOrange }}>{form[k]}</span></div>
          <input type="range" min={0} max={10} step={0.5} value={form[k]} onChange={e=>set(k,parseFloat(e.target.value))} style={{ width:"100%",accentColor:C.deepCyan }}/></div>
        ))}
      </div>
      <div style={{ marginTop:10,fontSize:14,color:C.deepCyan,fontWeight:900 }}>Media: {calcT()} / 10</div>
    </div>
    <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:14 }}>
      <Btn label="Cancelar" onClick={onClose} secondary/><Btn label="Guardar" onClick={()=>{if(!form.titulo)return alert("Título obligatorio");onSave({...form,total:calcT()});}}/>
    </div>
  </Modal>;
}

// ─── LISTA PAGE (drag & drop) ────────────────────────────────────────────────
function ListaPanel({who,color,lista,saveLista,biblioteca,leidos}) {
  const [dragIdx,setDragIdx]=useState(null);
  const [overIdx,setOverIdx]=useState(null);
  const [search,setSearch]=useState("");
  const [showAdd,setShowAdd]=useState(false);

  const leidosSet=useMemo(()=>new Set(leidos.map(l=>l.titulo?.toLowerCase().trim())),[leidos]);

  // Books currently in the list (in order), resolved from biblioteca
  const items=useMemo(()=>
    lista.map(id=>biblioteca.find(b=>b.id===id)).filter(Boolean)
  ,[lista,biblioteca]);

  // Books NOT in list and NOT read → candidates to add
  const candidates=useMemo(()=>
    biblioteca.filter(b=>
      !lista.includes(b.id) &&
      !leidosSet.has(b.titulo?.toLowerCase().trim()) &&
      (!search || b.titulo?.toLowerCase().includes(search.toLowerCase()) || b.autor?.toLowerCase().includes(search.toLowerCase()))
    )
  ,[biblioteca,lista,leidosSet,search]);

  function addToList(id){ saveLista([...lista,id]); }
  function removeFromList(id){ saveLista(lista.filter(x=>x!==id)); }
  function moveUp(idx){ if(idx===0) return; const l=[...lista]; [l[idx-1],l[idx]]=[l[idx],l[idx-1]]; saveLista(l); }
  function moveDown(idx){ if(idx===lista.length-1) return; const l=[...lista]; [l[idx],l[idx+1]]=[l[idx+1],l[idx]]; saveLista(l); }

  // Drag handlers
  function onDragStart(e,idx){ setDragIdx(idx); e.dataTransfer.effectAllowed="move"; }
  function onDragOver(e,idx){ e.preventDefault(); setOverIdx(idx); }
  function onDrop(e,idx){
    e.preventDefault();
    if(dragIdx===null||dragIdx===idx){ setDragIdx(null);setOverIdx(null);return; }
    const l=[...lista];
    const [moved]=l.splice(dragIdx,1);
    l.splice(idx,0,moved);
    saveLista(l);
    setDragIdx(null);setOverIdx(null);
  }
  function onDragEnd(){ setDragIdx(null);setOverIdx(null); }

  return <div style={{ flex:1,minWidth:0 }}>
    {/* Header */}
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,padding:"10px 14px",background:C.medCyan,borderRadius:10,border:`1px solid ${color}33` }}>
      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
        <div style={{ width:32,height:32,borderRadius:"50%",background:color,color:C.darkCyan,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14 }}>{who}</div>
        <div>
          <div style={{ fontSize:14,fontWeight:700,color:color }}>{who==="K"?"👩 Kiara":"👨 Pablo"}</div>
          <div style={{ fontSize:10,color:"#8cc" }}>{lista.length} libros ordenados</div>
        </div>
      </div>
      <Btn label={showAdd?"✕ Cerrar":"+ Añadir"} onClick={()=>setShowAdd(s=>!s)} secondary sm/>
    </div>

    {/* Add panel */}
    {showAdd&&<div style={{ background:"rgba(0,0,0,0.25)",borderRadius:8,padding:12,marginBottom:12,border:"1px solid #1a5a58" }}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar para añadir..." style={{...iS,marginBottom:8}}/>
      <div style={{ maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4 }}>
        {candidates.slice(0,40).map(b=>(
          <div key={b.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 8px",background:C.medCyan,borderRadius:6,fontSize:12 }}>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:C.paleOrange }}>{b.titulo}</div>
              <div style={{ fontSize:10,color:"#8cc" }}>{b.autor}</div>
            </div>
            <IBtn icon="+" onClick={()=>{ addToList(b.id); }} sm/>
          </div>
        ))}
        {!candidates.length&&<div style={{ color:"#556",fontSize:12,textAlign:"center",padding:8 }}>Sin resultados</div>}
      </div>
    </div>}

    {/* Drag list */}
    {!items.length
      ? <div style={{ textAlign:"center",padding:"32px 16px",color:"#445",fontSize:13,border:"1px dashed #1a4a48",borderRadius:8 }}>
          Añade libros para ordenarlos por prioridad.<br/>
          <span style={{ fontSize:11,color:"#334" }}>El orden afecta al aleatorio.</span>
        </div>
      : <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
          {items.map((b,idx)=>{
            const isDragging=dragIdx===idx;
            const isOver=overIdx===idx&&dragIdx!==idx;
            return <div key={b.id}
              draggable
              onDragStart={e=>onDragStart(e,idx)}
              onDragOver={e=>onDragOver(e,idx)}
              onDrop={e=>onDrop(e,idx)}
              onDragEnd={onDragEnd}
              style={{
                display:"flex",alignItems:"center",gap:8,
                padding:"8px 10px",borderRadius:8,
                background:isDragging?"rgba(5,175,106,0.08)":C.medCyan,
                border:`1px solid ${isOver?color:isDragging?"#1a5a58":"rgba(255,255,255,0.04)"}`,
                opacity:isDragging?0.5:1,
                cursor:"grab",
                transition:"border-color 0.1s",
                userSelect:"none",
              }}>
              {/* Position badge */}
              <div style={{ width:24,height:24,borderRadius:"50%",background:idx<3?color:"#1a3a38",color:idx<3?C.darkCyan:"#8cc",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,flexShrink:0 }}>{idx+1}</div>
              {/* Drag handle */}
              <span style={{ color:"#334",fontSize:14,flexShrink:0,cursor:"grab" }}>⠿</span>
              {/* Info */}
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:12,color:C.paleOrange,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{b.titulo}</div>
                <div style={{ fontSize:10,color:"#8cc" }}>{b.autor}</div>
              </div>
              {/* Recomendado tag */}
              {(b.recomendadoPor||[]).includes(who==="K"?"P":"K")&&
                <span style={{ fontSize:9,padding:"1px 6px",borderRadius:8,background:`${who==="K"?C.P:C.K}22`,color:who==="K"?C.P:C.K,border:`1px solid ${who==="K"?C.P:C.K}44`,flexShrink:0 }}>
                  💌 {who==="K"?"Pablo":"Kiara"}
                </span>}
              {/* Move buttons (fallback for touch) */}
              <div style={{ display:"flex",flexDirection:"column",gap:2,flexShrink:0 }}>
                <button onClick={()=>moveUp(idx)} disabled={idx===0} style={{ background:"none",border:"none",color:idx===0?"#334":"#8cc",cursor:idx===0?"default":"pointer",fontSize:10,padding:"1px 4px",lineHeight:1 }}>▲</button>
                <button onClick={()=>moveDown(idx)} disabled={idx===items.length-1} style={{ background:"none",border:"none",color:idx===items.length-1?"#334":"#8cc",cursor:idx===items.length-1?"default":"pointer",fontSize:10,padding:"1px 4px",lineHeight:1 }}>▼</button>
              </div>
              <IBtn icon="✕" onClick={()=>removeFromList(b.id)} danger sm/>
            </div>;
          })}
        </div>
    }
  </div>;
}

function ListaPage({biblioteca,leidos,listaK,saveListaK,listaP,saveListaP}) {
  return <div>
    <SH title="Listas de Prioridad" sub="Arrastra para ordenar · los primeros tienen más peso en el aleatorio"/>
    <div style={{ fontSize:11,color:"#556",marginBottom:16,padding:"8px 12px",background:"rgba(5,175,106,0.06)",borderRadius:8,border:"1px solid rgba(5,175,106,0.15)" }}>
      💡 Cada uno ordena su lista de forma independiente. El aleatorio usa la posición: cuanto más arriba, más probable que salga (según el slider de peso en 🎲 Aleatorio). También puedes usar los botones ▲▼ si estás en móvil.
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
      <ListaPanel who="K" color={C.K} lista={listaK} saveLista={saveListaK} biblioteca={biblioteca} leidos={leidos}/>
      <ListaPanel who="P" color={C.P} lista={listaP} saveLista={saveListaP} biblioteca={biblioteca} leidos={leidos}/>
    </div>
  </div>;
}

// ─── NAV & APP ────────────────────────────────────────────────────────────────
const NAV=[
  {id:"biblioteca",icon:"📚",label:"Biblioteca"},
  {id:"leidos",    icon:"✅",label:"Leídos"},
  {id:"lista",     icon:"📋",label:"Lista"},
  {id:"estadisticas",icon:"📊",label:"Stats"},
  {id:"aleatorio", icon:"🎲",label:"Aleatorio"},
  {id:"comprar",   icon:"🛒",label:"Comprar"},
];

export default function App() {
  const [page,setPage]=useState("biblioteca");
  const [leidos,saveLeidos,lL]   =useSharedStorage("kp_leidos_v4",SEED_LEIDOS);
  const [biblioteca,saveBiblioteca,bL]=useSharedStorage("kp_biblioteca_v4",SEED_BIBLIOTECA);
  const [listaK,saveListaK,lKL]  =useSharedStorage("kp_listaK_v1",[]);
  const [listaP,saveListaP,lPL]  =useSharedStorage("kp_listaP_v1",[]);

  if(!lL||!bL||!lKL||!lPL) return (
    <div style={{ background:C.darkCyan,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:32 }}>📚</div>
        <div style={{ color:C.medOrange,fontSize:18,fontFamily:"Georgia,serif",letterSpacing:2,marginTop:8 }}>K & P</div>
        <div style={{ color:"#8cc",fontSize:12,marginTop:6 }}>Cargando...</div>
      </div>
    </div>
  );

  const props={leidos,saveLeidos,biblioteca,saveBiblioteca};

  return <div style={{ fontFamily:"Georgia,serif",background:C.darkCyan,minHeight:"100vh",color:C.paleOrange,display:"flex",flexDirection:"column" }}>
    <div style={{ background:C.medCyan,padding:"14px 20px",borderBottom:`2px solid ${C.deepCyan}22`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
      <div>
        <div style={{ fontSize:10,letterSpacing:5,color:C.deepCyan,textTransform:"uppercase" }}>— BIBLIOTECA —</div>
        <h1 style={{ margin:"2px 0 0",fontSize:24,color:C.medOrange,letterSpacing:3 }}>K & P</h1>
      </div>
      <div style={{ display:"flex",gap:8 }}>
        <span style={{ background:C.K,color:C.darkCyan,padding:"4px 14px",borderRadius:20,fontSize:12,fontWeight:700 }}>Kiara</span>
        <span style={{ background:C.P,color:C.darkCyan,padding:"4px 14px",borderRadius:20,fontSize:12,fontWeight:700 }}>Pablo</span>
      </div>
    </div>
    <div style={{ display:"flex",background:C.medCyan,borderBottom:`1px solid #1a4a48`,overflowX:"auto",flexShrink:0 }}>
      {NAV.map(n=><button key={n.id} onClick={()=>setPage(n.id)}
        style={{ padding:"11px 18px",background:page===n.id?C.darkCyan:"transparent",color:page===n.id?C.medOrange:C.paleOrange,border:"none",cursor:"pointer",fontSize:12,fontFamily:"Georgia,serif",borderBottom:page===n.id?`2px solid ${C.deepCyan}`:"2px solid transparent",whiteSpace:"nowrap" }}>
        {n.icon} {n.label}
      </button>)}
    </div>
    <div style={{ flex:1,overflowY:"auto",padding:"20px 16px" }}>
      <div style={{ maxWidth:960,margin:"0 auto" }}>
        {page==="biblioteca"  &&<BibliotecaPage {...props}/>}
        {page==="leidos"      &&<LeidosPage {...props}/>}
        {page==="lista"       &&<ListaPage biblioteca={biblioteca} leidos={leidos} listaK={listaK} saveListaK={saveListaK} listaP={listaP} saveListaP={saveListaP}/>}
        {page==="estadisticas"&&<EstadisticasPage leidos={leidos}/>}
        {page==="aleatorio"   &&<AleatorioPage biblioteca={biblioteca} leidos={leidos} listaK={listaK} listaP={listaP}/>}
        {page==="comprar"     &&<ComprarPage leidos={leidos}/>}
      </div>
    </div>
  </div>;
}
