// Génère les pages anglaises (en/) à partir des pages françaises.
// Usage (depuis la racine du dépôt) : node tools/make-en.js .
// Après une modification de texte en français, ajouter la traduction dans `pairs` puis relancer.
const fs = require('fs');
const path = require('path');

const repo = process.argv[2];
const files = ['index.html', 'contact.html', 'projet1.html', 'projet3.html', 'projet4.html'];

const pairs = [
  // --- Navigation / commun ---
  [`>Alternance</a>`, `>Work-study</a>`],
  [`>Formation</a>`, `>Education</a>`],
  [`>Projets</a>`, `>Projects</a>`],
  [`>Compétences</a>`, `>Skills</a>`],
  [`Ouvrir ou fermer le menu`, `Open or close the menu`],
  [`Tous droits réservés.`, `All rights reserved.`],
  [`Technologies utilisées`, `Technologies used`],

  // --- Accueil : head + hero ---
  [`Portfolio de Nicolas Lyfoung, étudiant en informatique passionné par le développement web et les nouvelles technologies.`,
   `Portfolio of Nicolas Lyfoung, a computer science student passionate about web development and new technologies.`],
  [`Alternant chez PeopleSpheres · BUT Informatique 3ᵉ année`, `Work-study developer at PeopleSpheres · 3rd-year CS student`],
  [`data-roles="développeur web|curieux d'IA|adepte de DevOps|volleyeur &amp; basketteur|guitariste débutant">développeur web</span>`,
   `data-roles="web developer|AI enthusiast|DevOps fan|volleyball &amp; basketball player|beginner guitarist">web developer</span>`],
  [`En alternance chez PeopleSpheres et en 3ème année de BUT Informatique, je suis passionné par le développement web, les nouvelles technologies et la création d'applications innovantes.`,
   `On a work-study program at PeopleSpheres and in the third year of my computer science degree, I'm passionate about web development, new technologies and building innovative applications.`],
  [`Voir mes projets`, `See my projects`],
  [`Me contacter`, `Contact me`],
  [`Aller à la section Alternance`, `Go to the Work-study section`],

  // --- Accueil : alternance ---
  [`01 — En ce moment`, `01 — Right now`],
  [`En alternance chez PeopleSpheres</h2>`, `Work-study at PeopleSpheres</h2>`],
  [`Depuis le <strong>26 octobre 2026</strong>, je suis en alternance chez <strong>PeopleSpheres</strong>, en parallèle de ma troisième année de BUT Informatique à l'IUT de Montpellier.`,
   `Since <strong>October 26, 2026</strong>, I've been working at <strong>PeopleSpheres</strong> on a work-study program, alongside the third year of my BUT Informatique (a three-year computer science degree) at the IUT of Montpellier.`],
  [`J'y occupe le poste de <strong>Développeur junior R&amp;D</strong> : je corrige des bugs et je développe de nouvelles fonctionnalités, avec Laravel, PostgreSQL et Docker.`,
   `I work there as a <strong>Junior R&amp;D Developer</strong>: I fix bugs and build new features with Laravel, PostgreSQL and Docker.`],
  [`Curieux, autonome et rigoureux, j'aime comprendre comment les choses fonctionnent et aller au bout de mes idées. Travailler sur des projets concrets me motive énormément, surtout quand je peux mêler technique et logique.`,
   `Curious, self-reliant and rigorous, I like to understand how things work and to see my ideas through. Working on real-world projects motivates me a lot, especially when I can combine technique and logic.`],
  [`jours d'alternance chez PeopleSpheres, et ça continue`, `days of work-study at PeopleSpheres, and counting`],
  [`années de BUT Informatique à Montpellier`, `years of computer science studies in Montpellier`],
  [`mois de stage sur une application d'IA`, `months of internship on an AI application`],
  [`pages par rapport, analysées automatiquement par mon appli de stage`, `pages per report, analysed automatically by my internship app`],

  // --- Accueil : formation ---
  [`02 — Parcours`, `02 — Background`],
  [`>Formation</h2>`, `>Education</h2>`],
  [`2023 - Présent`, `2023 - Present`],
  [`>BUT Informatique</h3>`, `>BUT Informatique (Computer Science degree)</h3>`],
  [`Institut Universitaire Technologique de Montpellier`, `Montpellier University Institute of Technology (IUT)`],
  [`Ancien membre actif du Bureau des Étudiants (BDE)`, `Former active member of the student union (BDE)`],
  [`Baccalauréat Général`, `French Baccalauréat (general track)`],
  [`Spécialités : Mathématiques et NSI`, `Majors: Mathematics and Computer Science (NSI)`],
  [`Mention : Assez bien`, `With honours (mention "Assez bien")`],

  // --- Accueil : projet professionnel ---
  [`03 — Et après ?`, `03 — What's next?`],
  [`Projet professionnel envisagé après le BUT`, `My career plan after graduation`],
  [`Après l'obtention de mon BUT Informatique, mon objectif principal est de <strong>travailler pour acquérir de l'expérience professionnelle</strong> et découvrir concrètement les différents domaines du développement. Cette immersion me permettra de mieux comprendre les réalités du métier et d'identifier le type de développement qui me correspond le mieux.`,
   `After graduating, my main goal is to <strong>work and gain professional experience</strong> and discover the different areas of software development first-hand. This immersion will help me better understand the realities of the job and identify the kind of development that suits me best.`],
  [`Je suis particulièrement intéressé par l'exploration de plusieurs domaines : le <strong>développement web</strong> (frontend et backend), le <strong>DevOps</strong> et l'automatisation, ainsi que les <strong>applications utilisant l'intelligence artificielle</strong>. Cette phase d'expérimentation professionnelle sera déterminante pour orienter ma carrière vers la spécialisation qui me passionne le plus.`,
   `I'm particularly interested in exploring several areas: <strong>web development</strong> (frontend and backend), <strong>DevOps</strong> and automation, as well as <strong>applications powered by artificial intelligence</strong>. This period of professional experimentation will be decisive in steering my career towards the specialisation I'm most passionate about.`],
  [`Expérience terrain`, `Hands-on experience`],
  [`Acquérir des compétences en entreprise`, `Build skills in a company setting`],
  [`Explorer & découvrir`, `Explore & discover`],
  [`Tester différents types de développement`, `Try different kinds of development`],
  [`Trouver ma voie`, `Find my path`],
  [`Identifier ma spécialisation idéale`, `Identify my ideal specialisation`],

  // --- Accueil : projets ---
  [`04 — Réalisations`, `04 — Work`],
  [`Mes Projets`, `My Projects`],
  [`data-cursor="Voir"`, `data-cursor="View"`],
  [`Infrastructure Docker`, `Docker Infrastructure`],
  [`Mise en place d'une infrastructure complète de conteneurisation avec Docker pour orchestrer des applications multi-services`,
   `Setting up a complete Docker containerisation infrastructure to orchestrate multi-service applications`],
  [`Site Vitrine Flory Animation`, `Flory Animation Showcase Website`],
  [`Site vitrine Flory Animation`, `Flory Animation Showcase Website`],
  [`Création d'un site vitrine professionnel pour un particulier spécialisé dans l'animation d'événements`,
   `Building a professional showcase website for a self-employed event entertainer`],
  [`Stage Chaire Score`, `Chaire Score internship`],
  [`Stage - Chaire Score`, `Internship - Chaire Score`],
  [`Stage - Chaire SCORE`, `Internship - Chaire SCORE`],
  [`Développement d'une application web Python pour automatiser l'analyse de rapports financiers avec IA`,
   `Development of a Python web application that automates the analysis of financial reports with AI`],
  [`>Stage</span>`, `>Internship</span>`],
  [`IA/LLM`, `AI/LLM`],
  [`Voir le projet`, `View project`],

  // --- Accueil : compétences ---
  [`05 — Boîte à outils`, `05 — Toolbox`],
  [`>Compétences</h2>`, `>Skills</h2>`],
  [`Développement Web</h3>`, `Web Development</h3>`],
  [`Programmation</h3>`, `Programming</h3>`],
  [`Base de données</h3>`, `Databases</h3>`],
  [`Outils & DevOps`, `Tools & DevOps`],
  [`Travail d'équipe`, `Teamwork`],

  // --- Accueil : passions ---
  [`06 — Hors écran`, `06 — Off screen`],
  [`Mes passions`, `My passions`],
  [`Ballon de volley passant au-dessus d'un filet`, `Volleyball flying over a net`],
  [`Ballon de basket tiré dans un panier`, `Basketball shot into a hoop`],
  [`Cordes de guitare au-dessus de la rosace`, `Guitar strings over the sound hole`],
  [`<h3>Volley</h3>`, `<h3>Volleyball</h3>`],
  [`<h3>Basket</h3>`, `<h3>Basketball</h3>`],
  [`<h3>Guitare</h3>`, `<h3>Guitar</h3>`],
  [`Un sport où rien ne se gagne seul : lire le jeu, communiquer, couvrir ses coéquipiers.`,
   `A sport where nothing is won alone: reading the game, communicating, covering your teammates.`],
  [`Vitesse, stratégie et précision : l'esprit d'équipe au service de l'action décisive.`,
   `Speed, strategy and precision: team spirit in service of the decisive play.`],
  [`Je m'y suis mis il y a quelques mois : un accord après l'autre, pour exprimer ma créativité autrement.`,
   `I picked it up a few months ago: one chord after another, a different way to express my creativity.`],
  [`↑ survole ou touche pour servir`, `↑ hover or tap to serve`],
  [`↑ survole ou touche pour tirer`, `↑ hover or tap to shoot`],
  [`↑ gratte les cordes (souris ou tap)`, `↑ strum the strings (mouse or tap)`],

  // --- Accueil : footer ---
  [`Travaillons ensemble`, `Let's work together`],
  [`Une idée, un stage, une alternance ou juste envie d'échanger ?`, `An idea, an internship, a job opportunity or just want to chat?`],

  // --- Contact ---
  [`Contactez Nicolas Lyfoung pour vos projets de développement web ou pour toute opportunité professionnelle.`,
   `Get in touch with Nicolas Lyfoung about your web development projects or any professional opportunity.`],
  [`Contactez-moi`, `Get in touch`],
  [`Parlons de votre projet`, `Let's talk about your project`],
  [`Je suis toujours intéressé par de nouveaux projets et opportunités. N'hésitez pas à me contacter pour discuter de vos idées ou pour toute collaboration.`,
   `I'm always interested in new projects and opportunities. Feel free to reach out to discuss your ideas or any collaboration.`],
  [`Localisation`, `Location`],
  [`Nom complet`, `Full name`],
  [`Adresse email`, `Email address`],
  [`>Sujet</label>`, `>Subject</label>`],
  [`Envoyer le message`, `Send message`],
  [`Le message s'ouvre dans votre messagerie, prêt à être envoyé.`, `The message opens in your email client, ready to send.`],

  // --- Pages projet : commun ---
  [`Retour aux projets`, `Back to projects`],
  [`Vue d'ensemble`, `Overview`],
  [`Fonctionnalités principales`, `Key features`],
  [`Défis techniques`, `Technical challenges`],
  [`Compétences développées`, `Skills developed`],
  [`Expérience personnelle`, `Personal experience`],
  [`<h3>Contexte</h3>`, `<h3>Context</h3>`],
  [`Contexte du stage`, `Internship context`],
  [`Points clés`, `Key takeaways`],
  [`Projet suivant`, `Next project`],
  [`Projet précédent`, `Previous project`],
  [`Réaliser un développement d'application`, `Building an application`],
  [`Optimiser des applications`, `Optimising applications`],
  [`Gérer des données`, `Managing data`],
  [`Conduire un projet`, `Leading a project`],
  [`Administration système`, `System administration`],
  [`Créer une interface utilisateur`, `Designing a user interface`],
  [`Collaborer avec un client`, `Working with a client`],
  [`Collaborer au sein d'une équipe`, `Working within a team`],

  // --- Projet 1 : Docker ---
  [`Projet de conteneurisation et orchestration d'applications avec Docker et Docker Compose.`,
   `A project about containerising and orchestrating applications with Docker and Docker Compose.`],
  [`</i> En cours`, `</i> Ongoing`],
  [`Ce projet a permis d'automatiser le déploiement et de garantir la portabilité des environnements de développement à la production.`,
   `This project automated deployment and made environments portable from development to production.`],
  [`Architecture Docker`, `Docker architecture`],
  [`Ce projet a consisté à créer une infrastructure Docker complète pour orchestrer plusieurs services interconnectés. L'objectif était de conteneuriser une application web full-stack avec sa base de données, son serveur web et ses services auxiliaires.`,
   `This project consisted of building a complete Docker infrastructure to orchestrate several interconnected services. The goal was to containerise a full-stack web application along with its database, web server and auxiliary services.`],
  [`Le développement s'est concentré sur trois aspects principaux : la création de Dockerfiles optimisés pour chaque service, la mise en place d'une orchestration avec Docker Compose, et l'implémentation de bonnes pratiques de sécurité et de performance.`,
   `Development focused on three main aspects: writing optimised Dockerfiles for each service, setting up orchestration with Docker Compose, and applying security and performance best practices.`],
  [`Architecture multi-conteneurs avec Docker Compose`, `Multi-container architecture with Docker Compose`],
  [`Images Docker optimisées avec build multi-stage`, `Optimised Docker images using multi-stage builds`],
  [`Gestion des volumes pour la persistance des données`, `Volume management for data persistence`],
  [`Réseau Docker isolé pour la sécurité`, `Isolated Docker network for security`],
  [`Variables d'environnement pour la configuration`, `Environment variables for configuration`],
  [`Healthchecks et restart automatique des services`, `Healthchecks and automatic service restarts`],
  [`Le principal défi était d'optimiser la taille des images Docker tout en maintenant toutes les fonctionnalités nécessaires. J'ai utilisé des techniques de build multi-stage et choisi des images de base minimales (Alpine Linux) pour réduire l'empreinte.`,
   `The main challenge was to reduce the size of the Docker images while keeping every required feature. I used multi-stage build techniques and chose minimal base images (Alpine Linux) to shrink the footprint.`],
  [`La gestion de l'orchestration des services et de leurs dépendances a nécessité une attention particulière pour garantir un démarrage correct et une communication fluide entre les conteneurs.`,
   `Orchestrating the services and their dependencies required particular care to guarantee a correct start-up order and smooth communication between containers.`],
  [`Création de Dockerfiles optimisés`, `Writing optimised Dockerfiles`],
  [`Scripts d'automatisation en Bash`, `Automation scripts in Bash`],
  [`Configuration de services avec YAML`, `Service configuration with YAML`],
  [`Build multi-stage pour images légères`, `Multi-stage builds for lightweight images`],
  [`Mise en cache efficace des layers`, `Efficient layer caching`],
  [`Optimisation des temps de démarrage`, `Start-up time optimisation`],
  [`Volumes Docker pour la persistance`, `Docker volumes for persistence`],
  [`Backup et restore de conteneurs`, `Container backup and restore`],
  [`Gestion des bases de données conteneurisées`, `Managing containerised databases`],
  [`Documentation complète avec README`, `Complete documentation with a README`],
  [`Versionning avec Git et GitFlow`, `Version control with Git and GitFlow`],
  [`CI/CD avec GitHub Actions`, `CI/CD with GitHub Actions`],
  [`Sécurisation des conteneurs`, `Container hardening`],
  [`Gestion des réseaux Docker`, `Docker network management`],
  [`Monitoring et logging centralisé`, `Centralised monitoring and logging`],
  [`Projet personnel réalisé dans le cadre d'une formation DevOps pour améliorer mes compétences en conteneurisation.`,
   `A personal project carried out as part of a DevOps course to improve my containerisation skills.`],
  [`Architecture microservices`, `Microservices architecture`],
  [`Images optimisées et sécurisées`, `Optimised and secure images`],
  [`Orchestration automatisée`, `Automated orchestration`],
  [`Environnements reproductibles`, `Reproducible environments`],

  // --- Projet 3 : Flory Animation ---
  [`Création d'un site vitrine pour un particulier afin d'augmenter sa visibilité en ligne.`,
   `Building a showcase website for a self-employed professional to increase their online visibility.`],
  [`</i> Site Web`, `</i> Website`],
  [`</i> 2 mois`, `</i> 2 months`],
  [`Le projet avait pour objectif d'augmenter sa visibilité en ligne et de présenter ses services de manière attractive et professionnelle.`,
   `The project aimed to increase their online visibility and present their services in an attractive, professional way.`],
  [`Aperçu du site Flory Animation`, `Preview of the Flory Animation website`],
  [`Ce projet a été réalisé pour un professionnel de l'animation d'événements souhaitant développer sa présence en ligne. L'objectif principal était de créer un site vitrine moderne, attractif et optimisé pour le référencement naturel (SEO) afin d'attirer de nouveaux clients.`,
   `This project was built for an event entertainment professional who wanted to grow their online presence. The main goal was to create a modern, attractive showcase website optimised for search engines (SEO) in order to attract new clients.`],
  [`Le développement s'est concentré sur trois aspects essentiels : une interface utilisateur intuitive et responsive, une présentation claire des services proposés, et une optimisation pour les moteurs de recherche afin de maximiser la visibilité en ligne du client.`,
   `Development focused on three essential aspects: an intuitive, responsive user interface, a clear presentation of the services offered, and search engine optimisation to maximise the client's online visibility.`],
  [`Design responsive adapté à tous les appareils`, `Responsive design for every device`],
  [`Galerie photos interactive des événements`, `Interactive photo gallery of events`],
  [`Formulaire de contact avec validation`, `Contact form with validation`],
  [`Page de présentation des services détaillés`, `Detailed services page`],
  [`Optimisation SEO pour améliorer le référencement`, `SEO optimisation to improve search ranking`],
  [`Animations et transitions fluides`, `Smooth animations and transitions`],
  [`Le principal défi était de créer un site performant et léger tout en offrant une expérience visuelle attractive. J'ai privilégié l'utilisation de technologies web natives (HTML, CSS, JavaScript) pour garantir des temps de chargement rapides et une maintenance facilitée.`,
   `The main challenge was to build a fast, lightweight site while still offering an attractive visual experience. I chose native web technologies (HTML, CSS, JavaScript) to guarantee quick loading times and easy maintenance.`],
  [`L'optimisation pour le référencement naturel a nécessité une attention particulière sur la structure HTML sémantique, les balises meta, et l'optimisation des images pour améliorer les performances et la visibilité sur les moteurs de recherche.`,
   `Search engine optimisation required particular attention to semantic HTML structure, meta tags and image optimisation, to improve both performance and visibility on search engines.`],
  [`Développement HTML5/CSS3 moderne`, `Modern HTML5/CSS3 development`],
  [`JavaScript vanilla pour les interactions`, `Vanilla JavaScript for interactions`],
  [`Respect des standards du web`, `Compliance with web standards`],
  [`Optimisation des performances web`, `Web performance optimisation`],
  [`Compression et optimisation d'images`, `Image compression and optimisation`],
  [`Amélioration du référencement SEO`, `Improved SEO ranking`],
  [`Design responsive mobile-first`, `Mobile-first responsive design`],
  [`Création d'une identité visuelle`, `Creating a visual identity`],
  [`UX/UI optimisée pour la conversion`, `UX/UI optimised for conversion`],
  [`Gestion des besoins client`, `Managing client requirements`],
  [`Planning et livraison des fonctionnalités`, `Planning and delivering features`],
  [`Gestion des versions avec Git`, `Version control with Git`],
  [`Communication régulière avec le client`, `Regular communication with the client`],
  [`Recueil et analyse des besoins`, `Gathering and analysing requirements`],
  [`Formation à la maintenance du site`, `Training on site maintenance`],
  [`Projet réalisé en freelance pour un professionnel de l'animation d'événements souhaitant développer sa visibilité en ligne.`,
   `A freelance project for an event entertainment professional who wanted to grow their online visibility.`],
  [`Gestion complète d'un projet client`, `End-to-end management of a client project`],
  [`Optimisation SEO efficace`, `Effective SEO optimisation`],
  [`Design moderne et responsive`, `Modern, responsive design`],
  [`Performance et accessibilité`, `Performance and accessibility`],

  // --- Projet 4 : stage Chaire Score ---
  [`Janvier - Mars 2025`, `January - March 2025`],
  [`</i> Application IA`, `</i> AI application`],
  [`</i> 3 mois`, `</i> 3 months`],
  [`Application web en Python pour automatiser l'analyse de rapports financiers et vérifier leur conformité à une réglementation européenne en intégrant de l'IA.`,
   `A Python web application that automates the analysis of financial reports and checks their compliance with a European regulation, using AI.`],
  [`Interface de l'application d'analyse de rapports financiers`, `Interface of the financial report analysis application`],
  [`Ce projet répondait à un besoin concret de la Chaire SCORE, qui réalisait auparavant cette analyse manuellement, un processus long et répétitif compte tenu de la taille des rapports (souvent entre 150 et 600 pages). L'application vise ainsi à optimiser ce travail en le rendant automatique.`,
   `This project met a concrete need of the Chaire SCORE, which previously carried out this analysis by hand, a long and repetitive process given the size of the reports (often between 150 and 600 pages). The application streamlines that work by automating it.`],
  [`Le développement a impliqué l'utilisation majoritaire de Python. Un élément central du projet a été l'intégration d'un Large Language Model (LLM) via une API fournie par l'ISDM de Montpellier.`,
   `Development was done mostly in Python. A central part of the project was integrating a Large Language Model (LLM) through an API provided by the ISDM in Montpellier.`],
  [`Lors de mon stage, j'ai développé une application d'IA innovante permettant d'automatiser l'analyse de conformité réglementaire, remplaçant un processus manuel long et complexe. J'ai relevé plusieurs défis techniques, notamment les limites des modèles de langage et l'optimisation des performances.`,
   `During my internship, I developed an innovative AI application that automates regulatory compliance analysis, replacing a long and complex manual process. I tackled several technical challenges, notably the limits of language models and performance optimisation.`],
  [`En autonomie, j'ai appris et intégré JavaScript, FastAPI et LangChain pour mener à bien ce projet. Cette solution a eu un impact concret en répondant à un besoin métier réel. Ce stage m'a permis de renforcer mes compétences techniques, en gestion de projet et en communication.`,
   `Working independently, I learned and integrated JavaScript, FastAPI and LangChain to complete this project. The solution had a concrete impact by meeting a real business need. The internship strengthened my technical, project management and communication skills.`],
  [`Développement d'une solution d'IA innovante : Automatisation d'un processus métier complexe grâce à une application combinant FastAPI, LangChain et JavaScript.`,
   `Building an innovative AI solution: automating a complex business process with an application combining FastAPI, LangChain and JavaScript.`],
  [`Autonomie et montée en compétences : Apprentissage autodidacte de technologies variées et gestion complète du projet, de la conception à la mise en production.`,
   `Autonomy and upskilling: self-taught learning of various technologies and full ownership of the project, from design to production.`],
  [`Automatisation de l'analyse de conformité réglementaire`, `Automated regulatory compliance analysis`],
  [`Archivage et historique des analyses précédentes`, `Archive and history of previous analyses`],
  [`Interface de modification des questions d'analyse`, `Interface for editing the analysis questions`],
  [`Optimisation des requêtes vers le LLM`, `Optimised requests to the LLM`],
  [`Génération de rapports détaillés`, `Detailed report generation`],
  [`Analyse des besoins pour une application d'automatisation`, `Requirements analysis for an automation application`],
  [`Développement en Python, HTML, CSS et JavaScript`, `Development in Python, HTML, CSS and JavaScript`],
  [`Intégration d'un LLM via API`, `LLM integration through an API`],
  [`Architecture FastAPI et LangChain`, `FastAPI and LangChain architecture`],
  [`Optimisation des requêtes API vers le LLM`, `Optimising API requests to the LLM`],
  [`Évaluation et amélioration des performances`, `Measuring and improving performance`],
  [`Gestion des contraintes de temps et de ressources`, `Managing time and resource constraints`],
  [`Exploitation de données pour l'analyse automatisée`, `Using data for automated analysis`],
  [`Organisation et restitution des données`, `Organising and presenting data`],
  [`Conception d'une base de questions structurée`, `Designing a structured question base`],
  [`Gestion des étapes clés en temps limité`, `Managing key milestones on a tight schedule`],
  [`Documentation complète de l'architecture`, `Complete architecture documentation`],
  [`Intégration dans l'équipe de recherche`, `Integration into the research team`],
  [`Communication avec les différents intervenants`, `Communication with the various stakeholders`],
  [`Présentation des résultats et solutions`, `Presenting results and solutions`],
  [`Stage réalisé au sein de la Chaire Score de l'Université de Montpellier, de janvier à mars 2025. Projet en collaboration avec l'ISDM pour l'accès aux modèles de langage.`,
   `Internship carried out at the Chaire Score of the University of Montpellier, from January to March 2025. Project in collaboration with the ISDM for access to language models.`],
  [`Application web d'automatisation`, `Automation web application`],
  [`Intelligence artificielle appliquée`, `Applied artificial intelligence`],
  [`Optimisation de processus métier`, `Business process optimisation`],
  [`Développement en autonomie`, `Independent development`],
  [`Impact concret sur l'organisation`, `Concrete impact on the organisation`],
];

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toRegex = (text) => new RegExp(escapeRegex(text).replace(/\s+/g, '\\s+'), 'g');
const sorted = pairs.slice().sort((a, b) => b[0].length - a[0].length).map(([fr, en]) => ({ fr, en, regex: toRegex(fr), hits: 0 }));

const switchFr = (file) => `<a href="en/${file}" class="navbar-link lang-switch" lang="en" hreflang="en" aria-label="English version">EN</a>`;
const switchEn = (file) => `<a href="../${file}" class="navbar-link lang-switch" lang="fr" hreflang="fr" aria-label="Version française">FR</a>`;
const altFr = (file) => `<link rel="alternate" hreflang="en" href="en/${file}">`;
const altEn = (file) => `<link rel="alternate" hreflang="fr" href="../${file}">`;

fs.mkdirSync(path.join(repo, 'en'), { recursive: true });

for (const file of files) {
  const source = path.join(repo, file);
  let html = fs.readFileSync(source, 'utf8');

  // 1. Page française : sélecteur de langue + lien alternate (une seule fois)
  if (!html.includes('lang-switch')) {
    html = html.replace(/([ \t]*)<li>\s*<a href="pdf\/cv\.pdf"/, (match, indent) => `${indent}<li>${switchFr(file)}</li>\n${match}`);
    html = html.replace(/([ \t]*)(<meta name="viewport"[^>]*>)/, (match, indent, meta) => `${indent}${meta}\n${indent}${altFr(file)}`);
    fs.writeFileSync(source, html);
  }

  // 2. Page anglaise
  let en = html;
  for (const pair of sorted) {
    en = en.replace(pair.regex, () => { pair.hits++; return pair.en; });
  }
  en = en
    .replace('<html lang="fr">', '<html lang="en">')
    .replace(switchFr(file), switchEn(file))
    .replace(altFr(file), altEn(file))
    .replace(/(href|src)="(css|js|img|pdf)\//g, '$1="../$2/');
  fs.writeFileSync(path.join(repo, 'en', file), en);

  // 3. Détection du français restant (texte visible et attributs lisibles)
  const visible = en
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, (tag) => (tag.match(/(?:alt|aria-label|content|placeholder|data-roles|data-cursor)="[^"]*"/g) || []).join(' '));
  visible.split(/\r?\n/).forEach((line) => {
    const text = line.trim();
    if (/[éèêëàâùûçôîï]|\b(les|des|une|pour|avec|dans|sur|mes|mon)\b/i.test(text)) console.log(`[reste FR] ${file}: ${text}`);
  });
}

sorted.filter((pair) => pair.hits === 0).forEach((pair) => console.log(`[non trouvé] ${pair.fr.slice(0, 90)}`));
console.log('Terminé.');
