
-- Create enum for priority levels
CREATE TYPE public.risk_priority AS ENUM ('high', 'medium', 'low');

-- Create the national security risks table
CREATE TABLE public.national_security_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_category TEXT NOT NULL,
  likelihood INTEGER NOT NULL CHECK (likelihood >= 1 AND likelihood <= 5),
  impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5),
  preparedness_gap INTEGER NOT NULL CHECK (preparedness_gap >= 1 AND preparedness_gap <= 5),
  rpn INTEGER NOT NULL DEFAULT 0,
  priority risk_priority NOT NULL DEFAULT 'medium',
  last_reviewed DATE DEFAULT CURRENT_DATE,
  assigned_lead TEXT,
  current_alerts TEXT,
  notes TEXT,
  playbook TEXT,
  live_feeds JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function to auto-calculate RPN and Priority
CREATE OR REPLACE FUNCTION calculate_rpn_and_priority()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate RPN
  NEW.rpn = NEW.likelihood * NEW.impact * NEW.preparedness_gap;
  
  -- Set priority based on RPN
  IF NEW.rpn >= 45 THEN
    NEW.priority = 'high';
  ELSIF NEW.rpn >= 25 THEN
    NEW.priority = 'medium';
  ELSE
    NEW.priority = 'low';
  END IF;
  
  -- Update timestamp
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-calculation
CREATE TRIGGER calculate_rpn_trigger
  BEFORE INSERT OR UPDATE ON public.national_security_risks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_rpn_and_priority();

-- Enable RLS
ALTER TABLE public.national_security_risks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage all security risks"
  ON public.national_security_risks
  FOR ALL
  USING (is_admin());

CREATE POLICY "Power users can read and update notes"
  ON public.national_security_risks
  FOR SELECT
  USING (is_power_user_or_admin());

CREATE POLICY "Power users can update limited fields"
  ON public.national_security_risks
  FOR UPDATE
  USING (is_power_user_or_admin())
  WITH CHECK (is_power_user_or_admin());

CREATE POLICY "Authenticated users can view security risks"
  ON public.national_security_risks
  FOR SELECT
  USING (true);

-- Insert initial data with the 10 threat categories
INSERT INTO public.national_security_risks (threat_category, likelihood, impact, preparedness_gap, assigned_lead, notes, playbook, live_feeds) VALUES
('Natural Hazards & Extreme Weather', 5, 5, 3, 'Emergency Management Canada', 'Includes floods, wildfires, hurricanes, earthquakes, and extreme weather events.', 
'# Natural Hazards & Extreme Weather Response Playbook

## Threat Overview
Natural hazards pose significant risks to Canadian infrastructure, communities, and economic stability. This includes floods, wildfires, hurricanes, earthquakes, ice storms, and extreme temperature events.

## Dependencies
- Environment and Climate Change Canada (ECCC)
- Provincial emergency management agencies
- Municipal emergency services
- Canadian Armed Forces (CAF)
- Infrastructure critical to response operations

## Core Actions

### Immediate Response (0-4 hours)
1. **Threat Assessment**
   - Monitor Environment Canada alerts and warnings
   - Assess impact on critical infrastructure
   - Evaluate population at risk
   - Coordinate with provincial/territorial partners

2. **Activation Protocols**
   - Activate Government Emergency Operations Centre (GEOC)
   - Deploy emergency response teams
   - Establish communication channels
   - Implement evacuation procedures if required

3. **Resource Mobilization**
   - Deploy Canadian Armed Forces if requested
   - Activate mutual aid agreements
   - Coordinate emergency supplies and equipment
   - Establish temporary shelters

### Short-term Response (4-72 hours)
1. **Situation Management**
   - Conduct damage assessments
   - Prioritize life safety operations
   - Maintain critical infrastructure
   - Coordinate search and rescue operations

2. **Public Safety**
   - Issue public warnings and advisories
   - Manage evacuations and relocations
   - Provide emergency shelter and supplies
   - Maintain law and order

### Recovery Phase (72+ hours)
1. **Infrastructure Restoration**
   - Assess and repair critical infrastructure
   - Restore utilities and communications
   - Clear transportation routes
   - Rebuild damaged facilities

2. **Community Support**
   - Provide disaster financial assistance
   - Support mental health services
   - Facilitate return of displaced populations
   - Coordinate long-term recovery planning

## Communications Plan

### Internal Communications
- **Primary**: Secure government communications network
- **Backup**: Satellite communications
- **Coordination**: Daily briefings with all stakeholders
- **Reporting**: Hourly situation reports during active response

### Public Communications
- **Channels**: Emergency Alert System, social media, traditional media
- **Frequency**: Regular updates every 2-4 hours during active events
- **Languages**: English, French, and Indigenous languages as appropriate
- **Accessibility**: Multiple formats for persons with disabilities

### Stakeholder Communications
- **Provincial/Territorial**: Direct liaison through emergency management contacts
- **Municipal**: Regional coordination centers
- **International**: Through Global Affairs Canada if cross-border impacts
- **Private Sector**: Critical infrastructure operators and major employers

## Resource Requirements
- Emergency response personnel: 500-2000 depending on scale
- Equipment: Heavy machinery, emergency supplies, temporary shelters
- Transportation: Aircraft, vessels, ground vehicles
- Communications: Mobile command centers, satellite systems
- Medical: Field hospitals, ambulances, medical supplies

## Training and Exercises
- Annual national exercise program
- Quarterly tabletop exercises
- Monthly equipment checks
- Ongoing staff training and certification

## Performance Metrics
- Response time to initial alert
- Time to full activation
- Population evacuated/sheltered
- Infrastructure restored within 72 hours
- Public satisfaction with response', 
'[{"name": "Environment Canada Weather Warnings", "url": "https://weather.gc.ca/warnings/index_e.html", "description": "Real-time weather warnings and alerts for severe weather events across Canada"}, {"name": "Emergency Management Canada Alerts", "url": "https://www.publicsafety.gc.ca/cnt/mrgnc-mngmnt/index-en.aspx", "description": "National emergency management updates and coordination information"}, {"name": "Canadian Disaster Database", "url": "https://www.publicsafety.gc.ca/cnt/rsrcs/cndn-dsstr-dtbs/index-en.aspx", "description": "Historical disaster data and trends for risk assessment"}]'::jsonb),

('Terrorism & Violent Extremism', 3, 5, 3, 'RCMP National Security', 'Domestic and international terrorism threats targeting Canadian interests.', 
'# Terrorism & Violent Extremism Response Playbook

## Threat Overview
Terrorism and violent extremism pose significant threats to Canadian security, including domestic radicalization, international terrorism, and attacks on critical infrastructure or public gatherings.

## Dependencies
- Royal Canadian Mounted Police (RCMP)
- Canadian Security Intelligence Service (CSIS)
- Communications Security Establishment (CSE)
- Canadian Armed Forces
- Provincial and municipal law enforcement
- Emergency medical services
- International intelligence partners

## Core Actions

### Immediate Response (0-4 hours)
1. **Threat Validation**
   - Verify credibility of threat intelligence
   - Assess immediacy and scope of threat
   - Coordinate with intelligence agencies
   - Determine threat level elevation

2. **Law Enforcement Response**
   - Deploy specialized response teams (ERT, SWAT)
   - Establish security perimeters
   - Evacuate threatened areas
   - Implement traffic and crowd control

3. **Intelligence Coordination**
   - Share threat information across agencies
   - Monitor communication channels
   - Track suspect movements
   - Coordinate with international partners

### Short-term Response (4-72 hours)
1. **Investigation Management**
   - Secure and process crime scenes
   - Collect and analyze evidence
   - Interview witnesses and suspects
   - Coordinate forensic analysis

2. **Public Safety Measures**
   - Maintain elevated security at critical sites
   - Monitor for copycat threats
   - Coordinate with private security
   - Implement additional screening measures

3. **Strategic Communications**
   - Manage public information
   - Counter misinformation
   - Coordinate media response
   - Engage community leaders

### Long-term Response (72+ hours)
1. **Continued Investigation**
   - Pursue leads and connections
   - International cooperation
   - Financial investigation
   - Network analysis

2. **Prevention Measures**
   - Review and enhance security protocols
   - Community engagement programs
   - Counter-radicalization initiatives
   - Intelligence sharing improvements

## Communications Plan

### Internal Communications
- **Primary**: Secure RCMP communications network
- **Intelligence**: CSIS/CSE classified channels
- **Coordination**: Joint Intelligence Group meetings
- **Reporting**: Classified threat assessments

### Public Communications
- **Channels**: Official government statements, press conferences
- **Messaging**: Calm, factual, confidence-building
- **Timing**: Coordinated with operational requirements
- **Languages**: English, French, and community languages as needed

### International Communications
- **Partners**: Five Eyes intelligence alliance
- **Channels**: Diplomatic and intelligence networks
- **Information**: Threat indicators and prevention strategies
- **Coordination**: Joint operations and investigations

## Resource Requirements
- Specialized response teams: 50-200 personnel
- Equipment: Tactical gear, detection systems, forensic capabilities
- Intelligence: Surveillance and analysis capabilities
- Medical: Trauma care and mass casualty response
- Legal: Prosecution and detention capabilities

## Training and Exercises
- Monthly tactical training
- Quarterly multi-agency exercises
- Annual counter-terrorism exercise
- Ongoing intelligence analysis training

## Performance Metrics
- Response time to credible threats
- Prevention of successful attacks
- Investigation completion rates
- Intelligence sharing effectiveness
- Community engagement levels', 
'[{"name": "RCMP National Security Alerts", "url": "https://www.rcmp-grc.gc.ca/en/national-security", "description": "National security threat assessments and public safety information"}, {"name": "CSIS Threat Assessment", "url": "https://www.csis-scrs.gc.ca/en/publications", "description": "Intelligence assessments on terrorism and extremism threats"}, {"name": "Public Safety Terrorism Threat Level", "url": "https://www.publicsafety.gc.ca/cnt/ntnl-scrt/cntr-trrrsm/index-en.aspx", "description": "Current national terrorism threat level and related information"}]'::jsonb),

('Cyber Threats to Critical Infrastructure', 5, 4, 3, 'CSE Cyber Centre', 'State-sponsored and criminal cyber attacks on critical infrastructure and government systems.', 
'# Cyber Threats to Critical Infrastructure Response Playbook

## Threat Overview
Cyber threats targeting critical infrastructure pose significant risks to essential services including power grids, telecommunications, financial systems, healthcare, and transportation networks.

## Dependencies
- Communications Security Establishment (CSE)
- Canadian Centre for Cyber Security
- Critical infrastructure operators
- Provincial cyber security teams
- Private sector security partners
- International cyber security alliances

## Core Actions

### Immediate Response (0-4 hours)
1. **Threat Detection and Analysis**
   - Monitor network traffic anomalies
   - Analyze threat indicators
   - Identify affected systems
   - Assess potential impact

2. **Incident Response Activation**
   - Activate Cyber Security Operations Centre
   - Deploy incident response teams
   - Establish communication channels
   - Notify critical infrastructure operators

3. **Containment Measures**
   - Isolate affected systems
   - Implement emergency protocols
   - Activate backup systems
   - Coordinate with service providers

### Short-term Response (4-72 hours)
1. **Investigation and Attribution**
   - Conduct forensic analysis
   - Identify attack vectors
   - Determine threat actor capabilities
   - Coordinate with international partners

2. **System Recovery**
   - Restore critical services
   - Validate system integrity
   - Implement additional security measures
   - Monitor for persistent threats

3. **Stakeholder Coordination**
   - Brief critical infrastructure operators
   - Share threat intelligence
   - Coordinate response efforts
   - Update security protocols

### Long-term Response (72+ hours)
1. **System Hardening**
   - Patch vulnerabilities
   - Enhance monitoring capabilities
   - Update security architectures
   - Improve detection systems

2. **Threat Intelligence**
   - Share indicators of compromise
   - Develop threat profiles
   - Enhance predictive capabilities
   - Coordinate international response

## Communications Plan

### Internal Communications
- **Primary**: Secure government networks
- **Classified**: CSE secure communications
- **Coordination**: Daily cyber threat briefings
- **Reporting**: Real-time incident tracking

### Industry Communications
- **Channels**: Canadian Cyber Threat Exchange (CCTX)
- **Information**: Threat indicators and mitigation strategies
- **Frequency**: Continuous during active incidents
- **Format**: Technical bulletins and alerts

### Public Communications
- **Channels**: Public Safety Canada, industry associations
- **Messaging**: Service impacts and protective measures
- **Timing**: As soon as operational security permits
- **Audience**: Citizens, businesses, critical infrastructure users

## Resource Requirements
- Cyber analysts: 20-50 specialists
- Equipment: Advanced monitoring and analysis tools
- Intelligence: Threat intelligence platforms
- Legal: Cyber crime investigation capabilities
- International: Coordination with allied cyber centers

## Training and Exercises
- Weekly threat intelligence briefings
- Monthly incident response exercises
- Quarterly critical infrastructure exercises
- Annual national cyber exercise

## Performance Metrics
- Mean time to detection
- Mean time to containment
- System recovery time
- Threat intelligence sharing effectiveness
- Critical service availability', 
'[{"name": "Canadian Centre for Cyber Security", "url": "https://cyber.gc.ca/en/alerts-advisories", "description": "Cyber security alerts, advisories, and threat bulletins for Canadian organizations"}, {"name": "CSE Threat Intelligence", "url": "https://cse-cst.gc.ca/en/publications", "description": "Strategic cyber threat assessments and technical reports"}, {"name": "Critical Infrastructure Cyber Dashboard", "url": "https://www.publicsafety.gc.ca/cnt/ntnl-scrt/cbr-scrt/index-en.aspx", "description": "Real-time status of critical infrastructure cyber security"}]'::jsonb),

('Pandemics & Biological Incidents', 4, 5, 3, 'Public Health Agency of Canada', 'Infectious disease outbreaks and biological threats to public health.', 
'# Pandemics & Biological Incidents Response Playbook

## Threat Overview
Pandemic and biological incidents pose severe threats to public health, healthcare systems, economic stability, and social cohesion. This includes naturally occurring pandemics, bioterrorism, and laboratory accidents.

## Dependencies
- Public Health Agency of Canada (PHAC)
- Provincial and territorial health authorities
- Healthcare institutions
- Canadian Food Inspection Agency (CFIA)
- World Health Organization (WHO)
- International health partners

## Core Actions

### Immediate Response (0-4 hours)
1. **Threat Assessment**
   - Verify biological threat or outbreak
   - Assess transmissibility and severity
   - Determine geographic scope
   - Evaluate healthcare system capacity

2. **Public Health Measures**
   - Activate emergency operations centers
   - Deploy public health teams
   - Implement surveillance systems
   - Initiate contact tracing protocols

3. **Healthcare System Preparation**
   - Alert healthcare facilities
   - Activate surge capacity plans
   - Secure medical supplies
   - Implement infection control measures

### Short-term Response (4-72 hours)
1. **Containment Strategies**
   - Implement quarantine measures
   - Establish isolation facilities
   - Control movement and gatherings
   - Coordinate border health measures

2. **Medical Countermeasures**
   - Distribute personal protective equipment
   - Deploy diagnostic capabilities
   - Coordinate treatment protocols
   - Manage pharmaceutical supplies

3. **Communication and Coordination**
   - Issue public health advisories
   - Brief healthcare providers
   - Coordinate with international partners
   - Manage public information

### Long-term Response (72+ hours)
1. **Sustained Response**
   - Maintain public health measures
   - Monitor epidemiological trends
   - Adapt response strategies
   - Support healthcare workforce

2. **Recovery Planning**
   - Assess long-term health impacts
   - Plan healthcare system recovery
   - Address economic and social impacts
   - Prepare for future outbreaks

## Communications Plan

### Internal Communications
- **Primary**: Public health networks
- **Coordination**: Daily epidemiological briefings
- **Healthcare**: Direct communication with providers
- **Government**: Integrated emergency response

### Public Communications
- **Channels**: Multiple media platforms
- **Frequency**: Regular updates during active response
- **Messaging**: Clear, science-based, culturally appropriate
- **Languages**: English, French, Indigenous languages

### International Communications
- **WHO**: Global health security coordination
- **Partners**: Bilateral health agreements
- **Information**: Epidemiological data sharing
- **Research**: Collaborative research efforts

## Resource Requirements
- Public health personnel: 200-1000 specialists
- Medical supplies: PPE, diagnostics, therapeutics
- Laboratory capacity: Testing and research facilities
- Healthcare surge: Additional beds and equipment
- Logistics: Supply chain and distribution systems

## Training and Exercises
- Monthly surveillance system tests
- Quarterly outbreak response exercises
- Annual pandemic simulation
- Continuous healthcare provider training

## Performance Metrics
- Detection time for outbreaks
- Response activation time
- Healthcare system capacity utilization
- Public health measure compliance
- Morbidity and mortality outcomes', 
'[{"name": "Public Health Agency of Canada Alerts", "url": "https://www.canada.ca/en/public-health/services/emergency-preparedness-response.html", "description": "Public health emergency alerts and outbreak information for Canada"}, {"name": "WHO Disease Outbreak News", "url": "https://www.who.int/emergencies/disease-outbreak-news", "description": "Global disease outbreak monitoring and international health emergency updates"}, {"name": "GPHIN Global Intelligence", "url": "https://gphin.canada.ca/cepr/index.jsp", "description": "Global Public Health Intelligence Network for early warning of health threats"}]'::jsonb),

('State Espionage & Subversion', 3, 4, 3, 'CSIS Operations', 'Foreign intelligence activities targeting Canadian government, military, and economic interests.', 'Playbook in development.', 
'[{"name": "CSIS Annual Report", "url": "https://www.csis-scrs.gc.ca/en/publications", "description": "Annual threat assessment including state-sponsored espionage activities"}, {"name": "CSE Foreign Intelligence", "url": "https://cse-cst.gc.ca/en/publications", "description": "Foreign intelligence and cyber espionage threat assessments"}]'::jsonb),

('Gray Zone Conflict', 3, 4, 2, 'CAF Strategic Analysis', 'Hybrid warfare activities below the threshold of conventional conflict.', 'Playbook in development.', 
'[{"name": "Defence Intelligence Updates", "url": "https://www.canada.ca/en/department-national-defence/services/operations.html", "description": "Military intelligence and security situation reports"}, {"name": "Global Affairs Threat Analysis", "url": "https://www.international.gc.ca/world-monde/issues_development-enjeux_developpement/response_conflict-reponse_conflits/index.aspx", "description": "International conflict and security threat monitoring"}]'::jsonb),

('CBRN Incidents', 2, 5, 3, 'CBRN Response Team', 'Chemical, biological, radiological, and nuclear incidents and threats.', 'Playbook in development.', 
'[{"name": "CBRN National Response", "url": "https://www.publicsafety.gc.ca/cnt/mrgnc-mngmnt/rspndng-mrgnc-vnts/index-en.aspx", "description": "Chemical, biological, radiological, and nuclear emergency response coordination"}, {"name": "CNSC Radiation Monitoring", "url": "https://www.cnsc-ccsn.gc.ca/eng/resources/emergency-management-program/", "description": "Nuclear safety and radiation emergency response information"}]'::jsonb),

('Infrastructure Failure & Industrial Accidents', 3, 4, 3, 'Infrastructure Canada', 'Major infrastructure failures and industrial accidents affecting critical services.', 'Playbook in development.', 
'[{"name": "Infrastructure Monitoring", "url": "https://www.infrastructure.gc.ca/index-eng.html", "description": "National infrastructure status and emergency response coordination"}, {"name": "TSB Incident Reports", "url": "https://www.tsb.gc.ca/eng/index.html", "description": "Transportation Safety Board incident reports and safety alerts"}]'::jsonb),

('Economic & Supply Chain Disruption', 4, 4, 2, 'Finance Canada', 'Major economic disruptions and critical supply chain failures.', 'Playbook in development.', 
'[{"name": "Economic Intelligence", "url": "https://www.canada.ca/en/department-finance.html", "description": "Economic monitoring and financial system stability reports"}, {"name": "Supply Chain Monitoring", "url": "https://www.ic.gc.ca/eic/site/icgc.nsf/eng/home", "description": "Critical supply chain status and disruption alerts"}]'::jsonb),

('Mass Migration & Border Pressures', 3, 4, 3, 'CBSA Operations', 'Large-scale migration events and border security challenges.', 'Playbook in development.', 
'[{"name": "CBSA Border Operations", "url": "https://www.cbsa-asfc.gc.ca/agency-agence/reports-rapports/menu-eng.html", "description": "Border security situation reports and migration flow data"}, {"name": "IRCC Migration Trends", "url": "https://www.canada.ca/en/immigration-refugees-citizenship/corporate/reports-statistics.html", "description": "Immigration and refugee statistics and trend analysis"}]'::jsonb);
