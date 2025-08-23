import React, { useEffect, useRef } from 'react'
import { Box, Breadcrumbs, Link, Typography, List, ListItem, ListItemText } from '@mui/material'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { findGuideBySlug } from './guides/guideData'

const Img: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
        src={src || '/images/placeholder.svg'}
        alt={alt}
        style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }}
        onError={(e) => {
            const img = e.currentTarget
            if (!img.src.endsWith('/images/placeholder.svg')) {
                img.src = '/images/placeholder.svg'
            }
        }}
    />
)

const GuideDetail: React.FC = () => {
    const { slug = '' } = useParams<{ slug: string }>()
    const guide = findGuideBySlug(slug)
    const headingRef = useRef<HTMLHeadingElement>(null)

    useEffect(() => {
        headingRef.current?.focus()
    }, [slug])

    if (!guide) {
        return (
            <Box>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link component={RouterLink} underline="hover" color="inherit" to="/guides" data-testid="back-to-guides">
                        Guides
                    </Link>
                    <Typography color="text.primary">Not Found</Typography>
                </Breadcrumbs>
                <Typography variant="h5" tabIndex={-1} ref={headingRef} data-testid="not-found">
                    Guide not found
                </Typography>
            </Box>
        )
    }

    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} underline="hover" color="inherit" to="/guides" data-testid="back-to-guides">
                    Guides
                </Link>
                <Typography color="text.primary">{guide.title}</Typography>
            </Breadcrumbs>
            <Typography variant="h4" gutterBottom tabIndex={-1} ref={headingRef} data-testid="guide-detail-title">
                {guide.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {guide.brewer} • {guide.description}
            </Typography>

            <List sx={{ listStyleType: 'decimal', pl: 3 }}>
                {guide.steps.map((s, idx) => (
                    <ListItem key={idx} sx={{ display: 'list-item' }} data-testid="guide-step">
                        <ListItemText
                            primaryTypographyProps={{ component: 'div' }}
                            primary={<>
                                <Typography component="div">{s.text}</Typography>
                                <Img src={s.image} alt={s.alt || `Step ${idx + 1} image`} />
                            </>}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}

export default GuideDetail

