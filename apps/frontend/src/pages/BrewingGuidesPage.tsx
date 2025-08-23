import React, { useEffect, useRef } from 'react'
import { Box, Grid, Typography, Button } from '@mui/material'
import GuideCard from '../components/GuideCard'
import { guides } from './guides/guideData'
import { Link as RouterLink } from 'react-router-dom'

const BrewingGuidesPage: React.FC = () => {
    const headingRef = useRef<HTMLHeadingElement>(null)
    useEffect(() => {
        headingRef.current?.focus()
    }, [])

    if (!guides.length) {
        return (
            <Box textAlign="center" mt={8}>
                <Typography variant="h4" gutterBottom tabIndex={-1} ref={headingRef}>
                    Brewing Guides
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    No guides are available yet.
                </Typography>
                <Button component={RouterLink} to="/dashboard" variant="contained">
                    Go to Dashboard
                </Button>
            </Box>
        )
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom tabIndex={-1} ref={headingRef} data-testid="guides-title">
                Brewing Guides
            </Typography>
            <Grid container spacing={2} data-testid="guides-list">
                {guides.map((g) => (
                    <Grid item xs={12} sm={6} md={4} key={g.slug}>
                        <GuideCard
                            slug={g.slug}
                            title={g.title}
                            brewer={g.brewer}
                            description={g.description}
                            thumbnail={g.thumbnail}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}

export default BrewingGuidesPage

