# Core Workflows

## User Registration and Onboarding
1. **User visits the application** → Landing page with sign-up/login options
2. **User clicks "Sign Up"** → Registration form (email, username, password)
3. **Form validation** → Backend validates input and checks for existing users
4. **Account creation** → User record created in database, password hashed
5. **Welcome flow** → User redirected to onboarding tutorial or dashboard

## Coffee Logging Workflow
1. **User navigates to "Add Coffee"** → Coffee entry form
2. **Photo upload (optional)** → User uploads coffee bag photo
3. **AI text extraction** → Backend calls AI service to extract coffee details from image
4. **Manual entry/editing** → User can edit AI-extracted data or enter manually
5. **Save coffee** → Coffee record created in database
6. **Confirmation** → User sees success message and coffee added to gallery

## Brew Logging Workflow
1. **User selects coffee** → From their coffee gallery or search
2. **Start new brew log** → Brew log form with pre-filled coffee details
3. **Enter brewing parameters** → Method, weights, temperature, grind size, etc.
4. **AI tasting assistance** → AI prompts help user describe taste experience
5. **Save brew log** → Brew log saved with all parameters and notes
6. **View results** → User sees their brew log in the coffee's history

## AI Recommendation Workflow
1. **User requests recommendation** → From coffee detail page or dashboard
2. **Specify preferences** → User indicates desired changes (e.g., "more sweetness")
3. **AI analysis** → Backend analyzes user's brew history and preferences
4. **Generate suggestion** → AI suggests specific parameter changes
5. **Display recommendation** → User sees actionable brewing advice

## Coffee Discovery Workflow
1. **User browses coffee list** → Paginated list of all coffees in system
2. **Filter and search** → By origin, roaster, or other criteria
3. **View coffee details** → Coffee information and community brew logs
4. **Add to personal log** → User can add coffee to their collection
5. **Start brewing** → Direct link to create brew log for selected coffee

---