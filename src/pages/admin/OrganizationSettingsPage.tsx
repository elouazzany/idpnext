import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrganizationSettingsModal } from '../../components/admin/OrganizationSettingsModal'

export function OrganizationSettingsPage() {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(true)

    useEffect(() => {
        setIsModalOpen(true)
    }, [])

    const handleClose = () => {
        setIsModalOpen(false)
        navigate('/admin/data-model')
    }

    return (
        <div className="h-full bg-gray-50">
            <OrganizationSettingsModal isOpen={isModalOpen} onClose={handleClose} />
        </div>
    )
}
