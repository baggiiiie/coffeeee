export type GuideStep = {
    text: string
    image?: string
    alt?: string
}

export type Guide = {
    slug: string
    title: string
    brewer: string
    description: string
    thumbnail?: string
    steps: GuideStep[]
}

export const guides: Guide[] = [
    {
        slug: 'v60',
        title: 'V60 Pour-Over Guide',
        brewer: 'V60',
        description: 'A clean, bright cup highlighting clarity and nuance.',
        thumbnail: '/images/guides/v60/thumb.svg',
        steps: [
            { text: 'Rinse filter and preheat brewer and mug.', image: '/images/placeholder.svg', alt: 'Rinsing paper filter in V60 cone.' },
            { text: 'Add medium-fine ground coffee and level the bed.', image: '/images/placeholder.svg', alt: 'Ground coffee leveled in V60 filter.' },
            { text: 'Bloom with ~2x coffee weight for 30–45s.', image: '/images/placeholder.svg', alt: 'Blooming phase with initial pour wetting grounds.' },
            { text: 'Pour in slow concentric circles until target water weight.', image: '/images/placeholder.svg', alt: 'Spiral pour pattern into V60.' },
            { text: 'Gentle stir or swirl mid-brew if channeling appears.', image: '/images/placeholder.svg', alt: 'Gently stirring slurry to prevent channeling.' },
            { text: 'Let drain fully, swirl, and serve.', image: '/images/placeholder.svg', alt: 'Finished brew swirling in server.' },
        ],
    },
    {
        slug: 'chemex',
        title: 'Chemex Brewing Guide',
        brewer: 'Chemex',
        description: 'Balanced and clean profile with heavier filter.',
        thumbnail: '/images/guides/chemex/thumb.svg',
        steps: [
            { text: 'Fold and place Chemex filter, triple-fold side on spout; rinse well.', image: '/images/placeholder.svg', alt: 'Chemex filter placed and rinsed.' },
            { text: 'Add medium grind coffee and create a small well.', image: '/images/placeholder.svg', alt: 'Ground coffee in Chemex with a well.' },
            { text: 'Bloom adequately; ensure all grounds are saturated.', image: '/images/placeholder.svg', alt: 'Bloom phase in Chemex.' },
            { text: 'Pour in stages, maintaining a steady bed height.', image: '/images/placeholder.svg', alt: 'Stage-wise pouring into Chemex.' },
            { text: 'Adjust pour rate to keep drawdown between 3–5 minutes.', image: '/images/placeholder.svg', alt: 'Monitoring drawdown timing in Chemex.' },
            { text: 'Allow to draw down; remove filter and serve.', image: '/images/placeholder.svg', alt: 'Removing filter from Chemex.' },
        ],
    },
]

export const findGuideBySlug = (slug: string): Guide | undefined =>
    guides.find((g) => g.slug === slug)
