
import React, { useState } from 'react';
import { AlertLevel, IncidentSource, VerificationStatus } from '@/types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';

interface IncidentFormProps {
  isAuthorized?: boolean;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ isAuthorized = false }) => {
  const { provinces, addIncident, reportIncident } = useSupabaseDataContext();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [alertLevel, setAlertLevel] = useState<AlertLevel>(AlertLevel.WARNING);
  const [source, setSource] = useState<IncidentSource>(IncidentSource.GOVERNMENT);
  const [recommendedAction, setRecommendedAction] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const incidentData = {
      title,
      description,
      provinceId,
      alertLevel,
      source,
      verificationStatus: isAuthorized ? VerificationStatus.VERIFIED : VerificationStatus.UNVERIFIED,
      recommendedAction: recommendedAction || undefined,
    };
    
    if (isAuthorized) {
      addIncident(incidentData);
    } else {
      reportIncident({
        ...incidentData,
        source: IncidentSource.MANUAL,
      });
    }
    
    // Reset form
    setTitle('');
    setDescription('');
    setProvinceId('');
    setAlertLevel(AlertLevel.WARNING);
    setSource(IncidentSource.GOVERNMENT);
    setRecommendedAction('');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isAuthorized ? 'Add Security Incident' : 'Report Incident'}</CardTitle>
        <CardDescription>
          {isAuthorized 
            ? 'Create a new verified security incident alert' 
            : 'Submit information about a security concern in your area'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Incident Title</Label>
            <Input 
              id="title"
              placeholder="Brief title describing the incident"
              value={title}
              onChange={(e) => setTitle(e.target.value)} 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              placeholder="Detailed description of the incident"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Select 
                value={provinceId} 
                onValueChange={setProvinceId}
                required
              >
                <SelectTrigger id="province">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alertLevel">Alert Level</Label>
              <Select 
                value={alertLevel} 
                onValueChange={(value) => setAlertLevel(value as AlertLevel)}
                required
              >
                <SelectTrigger id="alertLevel">
                  <SelectValue placeholder="Select alert level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AlertLevel.NORMAL}>Normal</SelectItem>
                  <SelectItem value={AlertLevel.WARNING}>Warning</SelectItem>
                  <SelectItem value={AlertLevel.SEVERE}>Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isAuthorized && (
            <>
              <div className="space-y-2">
                <Label htmlFor="source">Information Source</Label>
                <Select 
                  value={source} 
                  onValueChange={(value) => setSource(value as IncidentSource)}
                  required
                >
                  <SelectTrigger id="source">
                    <SelectValue placeholder="Select information source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={IncidentSource.POLICE}>Police</SelectItem>
                    <SelectItem value={IncidentSource.GOVERNMENT}>Government</SelectItem>
                    <SelectItem value={IncidentSource.CYBERSECURITY}>Cybersecurity</SelectItem>
                    <SelectItem value={IncidentSource.EVERBRIDGE}>Everbridge</SelectItem>
                    <SelectItem value={IncidentSource.WEATHER}>Weather</SelectItem>
                    <SelectItem value={IncidentSource.TRAVEL}>Travel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="action">Recommended Action</Label>
                <Input 
                  id="action"
                  placeholder="What action should employees take?"
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit">
            {isAuthorized ? 'Add Incident' : 'Submit Report'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default IncidentForm;
