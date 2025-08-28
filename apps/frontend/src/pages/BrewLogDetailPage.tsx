import React, { useMemo } from 'react'
import { Box } from '@mui/material'
import { useParams } from 'react-router-dom'
import BrewLogForm from '../components/BrewLogForm'

const BrewLogDetailPage: React.FC = () => {
    const { id } = useParams()
    const logId = useMemo(() => Number(id || '0'), [id])
    return (
        <Box sx={{ py: 4 }} data-testid="brewlog-detail">
            <BrewLogForm mode="view" brewLogId={logId} title="Brew Log Detail" />
        </Box>
    )
}

export default BrewLogDetailPage
