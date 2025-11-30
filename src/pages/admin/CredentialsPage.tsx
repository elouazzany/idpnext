import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CredentialsModal } from '../../components/admin/CredentialsModal'

export function CredentialsPage() {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(true)

    useEffect(() => {
        // Open modal on mount
        setIsModalOpen(true)
    }, [])

    const handleClose = () => {
        setIsModalOpen(false)
        // Navigate back to previous admin page or default admin page
        navigate('/admin/data-model')
    }

    return (
        <div className="h-full bg-gray-50">
            <CredentialsModal isOpen={isModalOpen} onClose={handleClose} />
        </div>
    )
}
