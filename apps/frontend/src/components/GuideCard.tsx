import React from 'react'
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export type GuideCardProps = {
    slug: string
    title: string
    brewer: string
    description: string
    thumbnail?: string
}

const GuideCard: React.FC<GuideCardProps> = ({ slug, title, brewer, description, thumbnail }) => {
    const navigate = useNavigate()

    const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate(`/guides/${slug}`)
        }
    }

    const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
        const target = e.currentTarget
        if (target.src.endsWith('/images/placeholder.svg')) return
        target.src = '/images/placeholder.svg'
    }

    return (
        <Card data-testid="guide-card">
            <CardActionArea
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/guides/${slug}`)}
                onKeyDown={onKeyDown}
                aria-label={`Open ${title} guide`}
            >
                {thumbnail && (
                    <CardMedia
                        component="img"
                        height="140"
                        image={thumbnail}
                        alt={`${title} thumbnail`}
                        onError={handleError}
                    />
                )}
                <CardContent>
                    <Typography variant="h6" component="div" noWrap data-testid="guide-card-title">
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {brewer}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

export default GuideCard

