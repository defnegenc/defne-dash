# What are children's mental models of AI?

*Developmental psych / HCI literature on how kids conceptualize voice assistants, chatbots, and agency.*

## The short answer

Kids don't have one mental model of AI - they run several at once, and the mix shifts with age. The consistent finding across a decade of studies: young children start from an **agent template** (they reason about Alexa the way they reason about people), then gradually carve out a distinct ontological category for "smart devices" - things that are not alive, not human, but not ordinary objects either. Anthropomorphism isn't a bug that disappears; it becomes more selective.

## What the evidence actually shows

**Kids treat conversational AI as agents first.** Dietz, Outa, Lowe, Landay & Gweon (Stanford, CogSci 2023) ran a false-belief variant on 3-8 year olds: adults understand that two smart speakers can share the same "beliefs" (same backend), but by age 5 children expected each device to hold *separate* beliefs - exactly how they reason about two people. Children bootstrap from theory of mind, not from a machine model.

**Embodiment and interaction style drive attribution more than capability.** Druga, Williams, Breazeal & Resnick (MIT Media Lab, IDC 2017) had 26 kids (3-10) play with Alexa, Google Home, Cozmo, and a chatbot, then probed trust, intelligence, personality. Four themes: perceived intelligence, identity attribution, playfulness, understanding. Kids judged agents' intelligence relative to their own ("it's smarter than me at math, dumber at feelings") and attributed identity partly through voice and prosody - design surface, not internals.

**Older kids hold mixed, unstable ontologies.** Mertala & Fagerlund (Human Development, 2020) found primary schoolers split on what Alexa even *is* - person-like, machine, or a third thing. Andries & Robertson (Computers & Education: AI, 2023), studying 6-11 year olds with smart speakers at home, found kids fluently blended anthropomorphic talk ("she's kind") with mechanistic correction ("but she doesn't actually have feelings") - the title quote: "Alexa doesn't have that many feelings."

**Exposure sharpens boundaries rather than blurring them.** Festerling & Siraj (AI & Society, 2022, n=143 parent-child dyads, ages 7-11) tested whether growing up with voice assistants erodes the life/technology distinction (a worry going back to Bernstein & Crowley 2008). Finding: kids with more DVA exposure differentiated living vs. technological entities *more* rigorously on psychological criteria. The "kids will think machines are alive" panic has weak empirical support.

## Key papers and people

- Dietz et al., **Theory of AI Mind**, CogSci 2023 - https://sll.stanford.edu/docs/2023_cogsci/2023_Dietz_et_al_CogSci.pdf
- Druga, Williams, Breazeal, Resnick, **"Hey Google is it OK if I eat you?"**, IDC 2017 - https://robots.media.mit.edu/wp-content/uploads/sites/7/2017/06/idcwp0180-drugaACR.pdf
- Andries & Robertson, **"Alexa doesn't have that many feelings"**, Computers & Education: AI 2023 - https://arxiv.org/abs/2305.05597 (DOI: 10.1016/j.caeai.2023.100176)
- Mertala & Fagerlund, **"Alexa, What Are You?"**, Human Development 2020 - https://doi.org/10.1159/000508499
- Festerling & Siraj, **ontological conceptualizations of DVAs**, AI & Society 2022 - https://link.springer.com/article/10.1007/s00146-022-01555-3
- Newer LLM-era work: **Young children's anthropomorphism of an AI chatbot**, arXiv 2025 - https://arxiv.org/abs/2512.02179
- Key labs/people: Hyowon Gweon (Stanford SLL), Stefania Druga, Cynthia Breazeal & Randi Williams (MIT Personal Robots), Judy Robertson (Edinburgh).

## Honest state of the evidence

- Samples are small (n=26-143), mostly US/UK/Finland, mostly middle-class, and **almost entirely about pre-LLM voice assistants**. The LLM-generation literature (kids + ChatGPT-style chatbots) is only now appearing - the 2025-26 papers are the first wave.
- Methods are cross-sectional; we have almost no longitudinal data on whether early anthropomorphism changes adult intuitions.
- Measurement is hard: kids' verbal answers to "is Alexa alive?" conflate metaphor, politeness norms, and genuine ontology. The better studies (false-belief tasks, behavioral probes) show more anthropomorphism than interview studies.

## Where the debate actually sits

1. **Is anthropomorphism an error to design away, or a functional strategy?** One camp (AI literacy researchers, e.g. van Brummelen, Long & Magerko's "What is AI Literacy?", CHI 2020) treats accurate mechanism knowledge as the goal. The other notes that even adults anthropomorphize strategically and that a social frame may be *useful* for learning - the question is calibration, not elimination.
2. **Do conversational AIs blur the life/machine boundary for a whole generation?** Bernstein & Crowley's 2008 hypothesis; so far the evidence says no, or at least not simply - exposure correlates with sharper differentiation.
3. **Should kids' AI be designed to disclose its machine-ness?** Druga et al.'s design considerations vs. products that deliberately lean into persona. This is where the research meets actual product policy, and it's unresolved.
